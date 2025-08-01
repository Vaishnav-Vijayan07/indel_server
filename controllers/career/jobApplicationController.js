const { default: axios } = require("axios");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const { sendOtpEmail } = require("../../services/emailService");
const CustomError = require("../../utils/customError");
const crypto = require("crypto");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

class JobApplicationSubmissionController {
  // Generate and send OTP
  static async sendOtp(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) throw new CustomError("Email is required", 400);

      // Generate 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete existing OTPs for this email
      await models.Otp.destroy({ where: { email } });

      // Save OTP
      await models.Otp.create({ email, otp, expires_at: expiresAt });

      // Send OTP email
      await sendOtpEmail(email, otp);

      res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP and return applicant data if exists
  static async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) throw new CustomError("Email and OTP are required", 400);

      const otpRecord = await models.Otp.findOne({ where: { email, otp } });
      if (!otpRecord) throw new CustomError("Invalid OTP", 400);
      if (new Date() > otpRecord.expires_at) {
        await otpRecord.destroy();
        throw new CustomError("OTP expired", 400);
      }

      // Delete OTP after successful verification
      await otpRecord.destroy();

      // Fetch applicant data if exists
      const applicant = await models.Applicants.findOne({
        where: { email },
        attributes: [
          "id",
          "name",
          "email",
          "phone",
          "preferred_location",
          "referred_employee_name",
          "employee_referral_code",
          "age",
          "current_salary",
          "expected_salary",
          "file",
        ],
      });

      let modifiedData = null;

      if (applicant) {
        const preferred_role = await models.GeneralApplications.findOne({
          where: { applicant_id: applicant?.id },
          attributes: ["role_id"],
        });

        modifiedData = { ...applicant?.toJSON(), preferred_role: preferred_role?.role_id };
      }

      res.status(200).json({
        success: true,
        data: modifiedData || null,
        message: modifiedData ? "Applicant data retrieved" : "No applicant data found",
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitApplication(req, res, next) {
    try {
      const { applicant, job_application, recaptcha } = req.body;
      const file = req.file;

      // Validate reCAPTCHA token
      if (!recaptcha) {
        return res.status(400).json({ success: false, message: "reCAPTCHA token is missing" });
      }

      const recaptchaResponse = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("recaptchaResponse.data:", recaptchaResponse.data);

      const { success, score } = recaptchaResponse.data;

      if (!success || score < 0.5) {
        // Adjust score threshold as needed (0.5 is a common threshold for v3)
        return res.status(400).json({
          success: false,
          message: "reCAPTCHA verification failed. Please try again.",
        });
      }

      // Validate preferred location
      const location = await models.CareerLocations.findByPk(applicant?.preferred_location);
      if (!location) throw new CustomError("Preferred location not found", 404);

      // Validate job
      const job = await models.CareerJobs.findByPk(job_application?.job_id);
      if (!job) throw new CustomError("Job not found", 404);

      // Fetch "Pending" status
      const pendingStatus = await models.ApplicationStatus.findOne({
        where: { status_name: "Pending" },
      });
      if (!pendingStatus) throw new CustomError("Pending status not found", 500);

      // Check if applicant with this email already exists
      let existingApplicant = await models.Applicants.findOne({
        where: { email: applicant?.email },
      });

      let applicantRecord;

      if (existingApplicant) {
        // Check for existing application for this job
        const existingApplication = await models.JobApplications.findOne({
          where: {
            applicant_id: existingApplicant.id,
            job_id: job_application?.job_id,
          },
        });
        if (existingApplication) {
          throw new CustomError("You have already applied for this job", 409);
        }

        // Prepare update data
        const updateData = { ...applicant };
        if (file) {
          updateData.file = file.path;
          updateData.file_uploaded_at = new Date();
        }
        // Update applicant
        await existingApplicant.update(updateData);
        applicantRecord = existingApplicant;
      } else {
        // Prepare create data
        const createData = {
          ...applicant,
          file: file ? file.path : null,
          file_uploaded_at: file ? new Date() : null,
        };
        applicantRecord = await models.Applicants.create(createData);
      }

      // Create job application record
      const applicationData = {
        job_id: job_application?.job_id,
        applicant_id: applicantRecord.id,
        status_id: pendingStatus.id,
        is_active: job_application?.is_active ?? true,
        order: job_application?.order ?? 1,
      };
      const newApplication = await models.JobApplications.create(applicationData);

      // Invalidate caches
      await Promise.all([CacheService.invalidate("applicants"), CacheService.invalidate("job_applications")]);

      res.status(201).json({
        success: true,
        data: {
          applicant: applicantRecord,
          job_application: newApplication,
        },
        message: "Job application submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async listApplications(req, res, next) {
    try {
      const {
        role_id,
        location_id,
        state_id,
        status_id,
        applicant_location_id,
        limit = "10",
        offset = "0",
        from_date,
        to_date,
      } = req.query;

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 10); // Ensure limit >= 1
      const parsedOffset = Math.max(0, parseInt(offset, 10) || 0); // Ensure offset >= 0

      // Build cache key based on query parameters
      const cacheKey = `job_applications_all_${role_id || "all"}_${location_id || "all"}_${state_id || "all"}_${
        status_id || "all"
      }_${applicant_location_id || "all"}_${parsedLimit}_${parsedOffset}`;
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({
      //     success: true,
      //     data: JSON.parse(cachedData),
      //   });
      // }

      // Build filter conditions
      const whereConditions = {}; // Only active applications
      const jobWhere = {};
      const applicantWhere = {};

      if (status_id) {
        whereConditions.status_id = parseInt(status_id);
      }

      if (role_id) {
        jobWhere.role_id = parseInt(role_id);
      }

      if (location_id) {
        jobWhere.location_id = parseInt(location_id);
      }

      if (state_id) {
        jobWhere.state_id = parseInt(state_id);
      }

      if (applicant_location_id) {
        applicantWhere.preferred_location = parseInt(applicant_location_id);
      }

      if (from_date && to_date) {
        whereConditions.application_date = {
          [Op.between]: [new Date(from_date), new Date(to_date)],
        };
      } else if (from_date) {
        whereConditions.application_date = {
          [Op.gte]: new Date(from_date),
        };
      } else if (to_date) {
        whereConditions.application_date = {
          [Op.lte]: new Date(to_date),
        };
      }

      const { rows: applications, count: total } = await models.JobApplications.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: models.Applicants,
            as: "applicant",
            attributes: ["id", "name", "email", "phone", "file"],
            where: applicantWhere,
            include: [
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["id", "location_name"],
              },
            ],
          },
          {
            model: models.CareerJobs,
            as: "job",
            attributes: ["id", "job_title"],
            where: jobWhere,
            include: [
              {
                model: models.CareerRoles,
                as: "role",
                attributes: ["id", "role_name"],
              },
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["id", "location_name"],
              },
              {
                model: models.CareerStates,
                as: "state",
                attributes: ["id", "state_name"],
              },
            ],
          },
          {
            model: models.ApplicationStatus,
            as: "status",
            attributes: ["id", "status_name"],
          },
        ],
        order: [["application_date", "DESC"]],
        // attributes: ["id", "application_date", "order", "is_active"],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      const response = {
        success: true,
        data: applications,
        total,
        meta: {
          page: Math.floor(parsedOffset / parsedLimit) + 1,
          totalPages: Math.ceil(total / parsedLimit),
          limit: parsedLimit,
          offset: parsedOffset,
        },
      };

      // Store in cache for 1 hour
      await CacheService.set(cacheKey, JSON.stringify(response), 3600); // Cache for 1 hour

      res.status(200).json({
        status: "success",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitGeneralApplication(req, res, next) {
    try {
      const { applicant, general_application, recaptcha } = req.body;
      const file = req?.file;

      // Validate reCAPTCHA token
      if (!recaptcha) {
        return res.status(400).json({ success: false, message: "reCAPTCHA token is missing" });
      }

      const recaptchaResponse = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("recaptchaResponse.data:", recaptchaResponse.data);

      const { success, score } = recaptchaResponse.data;

      if (!success || score < 0.5) {
        // Adjust score threshold as needed (0.5 is a common threshold for v3)
        return res.status(400).json({
          success: false,
          message: "reCAPTCHA verification failed. Please try again.",
        });
      }

      // Validate preferred location
      const location = await models.CareerLocations.findByPk(applicant.preferred_location);
      if (!location) throw new CustomError("Preferred location not found", 404);

      // Validate role
      const role = await models.CareerRoles.findByPk(general_application?.role_id);
      if (!role) throw new CustomError("Role not found", 404);

      // Get "Pending" status
      const pendingStatus = await models.ApplicationStatus.findOne({
        where: { status_name: "Pending" },
      });
      if (!pendingStatus) throw new CustomError("Pending status not found", 500);

      let applicantRecord = await models.Applicants.findOne({
        where: { email: applicant?.email },
      });

      // Check if file is expired
      const isFileExpired = (record) => {
        if (!record?.file || !record.file_uploaded_at) return true;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return new Date(record.file_uploaded_at) < sixMonthsAgo;
      };

      if (applicantRecord) {
        // Check if any general application exists
        const existingApplication = await models.GeneralApplications.findOne({
          where: { applicant_id: applicantRecord?.id },
        });

        // Prepare updated data
        const updatedData = {
          ...applicant,
        };

        // Handle file logic:
        if (file) {
          // New file uploaded: update both fields
          updatedData.file = file.path;
          updatedData.file_uploaded_at = new Date();
        } else if (isFileExpired(applicantRecord)) {
          // No new file, but existing file is expired: clear fields
          updatedData.file = null;
          updatedData.file_uploaded_at = null;
        }
        // If no new file and file is not expired, keep existing fields

        await applicantRecord.update(updatedData);

        // If application exists, return response
        if (existingApplication) {
          return res.status(200).json({
            success: true,
            data: {
              applicant: applicantRecord,
              general_application: existingApplication,
            },
            message: "Application already exists. Details have been updated.",
          });
        }
      } else {
        // Create new applicant
        const newApplicantData = {
          ...applicant,
          file: file ? file.path : null,
          file_uploaded_at: file ? new Date() : null,
        };
        applicantRecord = await models.Applicants.create(newApplicantData);
      }

      // Create the general application
      const newApplication = await models.GeneralApplications.create({
        applicant_id: applicantRecord.id,
        status_id: pendingStatus.id,
        role_id: general_application?.role_id,
        preferred_role_name: general_application?.preferred_role_name,
      });

      // Invalidate caches
      await Promise.all([CacheService.invalidate("applicants"), CacheService.invalidate("general_applications")]);

      res.status(201).json({
        success: true,
        data: {
          applicant: applicantRecord,
          general_application: newApplication,
        },
        message: "General application submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async listGeneralApplications(req, res, next) {
    try {
      const { role_id, location_id, status_id, from_date, to_date, limit = "10", offset = "0" } = req.query;

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 10); // Ensure limit >= 1
      const parsedOffset = Math.max(0, parseInt(offset, 10) || 0); // Ensure offset >= 0

      // Build cache key based on query parameters
      const cacheKey = `general_applications_all_${role_id || "all"}_${location_id || "all"}_${
        status_id || "all"
      }_${parsedLimit}_${parsedOffset}`;
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({
      //     success: true,
      //     data: JSON.parse(cachedData),
      //   });
      // }

      // Build filter conditions
      const whereConditions = {};
      const applicantWhere = {};

      if (status_id) {
        whereConditions.status_id = parseInt(status_id);
      }

      if (role_id) {
        whereConditions.role_id = parseInt(role_id);
      }

      if (location_id) {
        applicantWhere.preferred_location = parseInt(location_id);
      }

      if (from_date && to_date) {
        whereConditions.application_date = {
          [Op.between]: [new Date(from_date), new Date(to_date)],
        };
      } else if (from_date) {
        whereConditions.application_date = {
          [Op.gte]: new Date(from_date),
        };
      } else if (to_date) {
        whereConditions.application_date = {
          [Op.lte]: new Date(to_date),
        };
      }

      const { rows: applications, count: total } = await models.GeneralApplications.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: models.Applicants,
            as: "applicant",
            attributes: ["id", "name", "email", "phone", "file"],
            where: applicantWhere,
            include: [
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["id", "location_name"],
              },
            ],
          },
          {
            model: models.CareerRoles,
            as: "role",
            attributes: ["id", "role_name"],
          },
          {
            model: models.ApplicationStatus,
            as: "status",
            attributes: ["id", "status_name"],
          },
        ],
        order: [["application_date", "DESC"]],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      // Prepare response
      const response = {
        success: true,
        data: applications,
        total,
        meta: {
          page: Math.floor(parsedOffset / parsedLimit) + 1,
          totalPages: Math.ceil(total / parsedLimit),
          limit: parsedLimit,
          offset: parsedOffset,
        },
      };

      // Store in cache
      await CacheService.set(cacheKey, JSON.stringify(response), 3600); // Cache for 1 hour

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status_id } = req.body;

      // Validate input
      if (!status_id) {
        return res.status(400).json({ success: false, message: "status_id is required" });
      }

      // Find the job application
      const application = await models.JobApplications.findByPk(id);
      if (!application) {
        return res.status(404).json({ success: false, message: "Job application not found" });
      }

      // Check if the status exists
      const status = await models.ApplicationStatus.findByPk(status_id);
      if (!status) {
        return res.status(400).json({ success: false, message: "Invalid status_id" });
      }

      // Update the status
      await application.update({ status_id });

      // Invalidate cache if needed
      await CacheService.invalidate("job_applications");

      // Optionally, include updated application with status details
      const updatedApplication = await models.JobApplications.findByPk(id, {
        include: [{ model: models.ApplicationStatus, as: "status", attributes: ["id", "status_name"] }],
      });

      res.json({
        success: true,
        data: updatedApplication,
        message: "Job application status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async changeStatusGeneral(req, res, next) {
    try {
      const { id } = req.params;
      const { status_id } = req.body;

      // Validate input
      if (!status_id) {
        return res.status(400).json({ success: false, message: "status_id is required" });
      }

      // Find the job application
      const application = await models.GeneralApplications.findByPk(id);
      if (!application) {
        return res.status(404).json({ success: false, message: "Job application not found" });
      }

      // Check if the status exists
      const status = await models.ApplicationStatus.findByPk(status_id);
      if (!status) {
        return res.status(400).json({ success: false, message: "Invalid status_id" });
      }

      // Update the status
      await application.update({ status_id });

      // Invalidate cache if needed
      await CacheService.invalidate("general_applications");

      // Optionally, include updated application with status details
      const updatedApplication = await models.GeneralApplications.findByPk(id, {
        include: [{ model: models.ApplicationStatus, as: "status", attributes: ["id", "status_name"] }],
      });

      res.json({
        success: true,
        data: updatedApplication,
        message: "General application status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportApplicationsToExcel(req, res, next) {
    try {
      const { role_id, location_id, state_id, status_id, applicant_location_id, from_date, to_date } = req.query;

      // Build filter conditions (same as your listing API)
      const whereConditions = {};
      const jobWhere = {};
      const applicantWhere = {};

      if (status_id) {
        whereConditions.status_id = parseInt(status_id);
      }

      if (role_id) {
        jobWhere.role_id = parseInt(role_id);
      }

      if (location_id) {
        jobWhere.location_id = parseInt(location_id);
      }

      if (state_id) {
        jobWhere.state_id = parseInt(state_id);
      }

      if (applicant_location_id) {
        applicantWhere.preferred_location = parseInt(applicant_location_id);
      }

      if (from_date && to_date) {
        whereConditions.application_date = {
          [Op.between]: [new Date(from_date), new Date(to_date)],
        };
      } else if (from_date) {
        whereConditions.application_date = {
          [Op.gte]: new Date(from_date),
        };
      } else if (to_date) {
        whereConditions.application_date = {
          [Op.lte]: new Date(to_date),
        };
      }

      // Fetch all applications without pagination for export
      const { rows: applications } = await models.JobApplications.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: models.Applicants,
            as: "applicant",
            attributes: ["id", "name", "email", "phone", "file"],
            where: applicantWhere,
            include: [
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["id", "location_name"],
              },
            ],
          },
          {
            model: models.CareerJobs,
            as: "job",
            attributes: ["id", "job_title"],
            where: jobWhere,
            include: [
              {
                model: models.CareerRoles,
                as: "role",
                attributes: ["id", "role_name"],
              },
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["id", "location_name"],
              },
              {
                model: models.CareerStates,
                as: "state",
                attributes: ["id", "state_name"],
              },
            ],
          },
          {
            model: models.ApplicationStatus,
            as: "status",
            attributes: ["id", "status_name"],
          },
        ],
        order: [["application_date", "DESC"]],
      });

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Job Applications");

      // Define columns
      worksheet.columns = [
        { header: "Application ID", key: "applicationId", width: 15 },
        { header: "Applicant Name", key: "applicantName", width: 20 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Job Title", key: "jobTitle", width: 25 },
        { header: "Role", key: "role", width: 20 },
        { header: "Job Location", key: "jobLocation", width: 20 },
        { header: "State", key: "state", width: 15 },
        // { header: "Preffered Location", key: "applicantLocation", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Application Date", key: "applicationDate", width: 20 },
        { header: "Resume", key: "resume", width: 30 },
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add data rows
      applications.forEach((app, index) => {
        const row = worksheet.addRow({
          applicationId: app.id,
          applicantName: app.applicant?.name || "N/A",
          email: app.applicant?.email || "N/A",
          phone: app.applicant?.phone || "N/A",
          jobTitle: app.job?.job_title || "N/A",
          role: app.job?.role?.role_name || "N/A",
          jobLocation: app.job?.location?.location_name || "N/A",
          state: app.job?.state?.state_name || "N/A",
          // applicantLocation: app.applicant?.location?.location_name || "N/A",
          status: app.status?.status_name || "N/A",
          applicationDate: app.application_date ? new Date(app.application_date).toLocaleDateString("en-GB") : "N/A",
          resume: app.applicant?.file ? `Resume_${app.applicant.name}_${app.id}` : "No Resume",
        });

        // Add hyperlink for resume if file exists
        if (app.applicant?.file) {
          const resumeCell = row.getCell("resume");

          // Construct the full URL for the resume
          const baseUrl = process.env.BASE_URL;
          const resumeUrl = `${baseUrl}/${app.applicant.file}`;

          // Add hyperlink
          resumeCell.value = {
            text: `Resume_${app.applicant.name}_${app.id}`,
            hyperlink: resumeUrl,
          };

          // Style the hyperlink
          resumeCell.font = {
            color: { argb: "FF0000FF" },
            underline: true,
          };
        }
      });

      // Set response headers for Excel download
      const filename = `job_applications_${new Date().toISOString().split("T")[0]}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  static async exportGeneralApplicationsToExcel(req, res, next) {
    try {
      const { role_id, location_id, status_id, from_date, to_date } = req.query;

      // Build filter conditions (same as listGeneralApplications)
      const whereConditions = {};
      const applicantWhere = {};

      if (status_id) {
        whereConditions.status_id = parseInt(status_id);
      }

      if (role_id) {
        whereConditions.role_id = parseInt(role_id);
      }

      if (location_id) {
        applicantWhere.preferred_location = parseInt(location_id);
      }

      if (from_date && to_date) {
        whereConditions.application_date = {
          [Op.between]: [new Date(from_date), new Date(to_date)],
        };
      } else if (from_date) {
        whereConditions.application_date = {
          [Op.gte]: new Date(from_date),
        };
      } else if (to_date) {
        whereConditions.application_date = {
          [Op.lte]: new Date(to_date),
        };
      }

      // Fetch all general applications without pagination for export
      const { rows: applications } = await models.GeneralApplications.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: models.Applicants,
            as: "applicant",
            attributes: ["id", "name", "email", "phone", "file"],
            where: applicantWhere,
            include: [
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["id", "location_name"],
              },
            ],
          },
          {
            model: models.CareerRoles,
            as: "role",
            attributes: ["id", "role_name"],
          },
          {
            model: models.ApplicationStatus,
            as: "status",
            attributes: ["id", "status_name"],
          },
        ],
        order: [["application_date", "DESC"]],
      });

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("General Applications");

      // Define columns
      worksheet.columns = [
        { header: "Application ID", key: "applicationId", width: 15 },
        { header: "Applicant Name", key: "applicantName", width: 20 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Role", key: "role", width: 20 },
        { header: "Preferred Location", key: "preferredLocation", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Application Date", key: "applicationDate", width: 20 },
        { header: "Resume", key: "resume", width: 30 },
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add data rows
      applications.forEach((app) => {
        const row = worksheet.addRow({
          applicationId: app.id,
          applicantName: app.applicant?.name || "N/A",
          email: app.applicant?.email || "N/A",
          phone: app.applicant?.phone || "N/A",
          role: app.role?.role_name || "N/A",
          preferredLocation: app.applicant?.location?.location_name || "N/A",
          status: app.status?.status_name || "N/A",
          applicationDate: app.application_date ? new Date(app.application_date).toLocaleDateString("en-GB") : "N/A",
          resume: app.applicant?.file ? `Resume_${app.applicant.name}_${app.id}` : "No Resume",
        });

        // Add hyperlink for resume if file exists
        if (app.applicant?.file) {
          const resumeCell = row.getCell("resume");

          // Construct the full URL for the resume
          const baseUrl = process.env.BASE_URL || req.protocol + "://" + req.get("host");
          const resumeUrl = `${baseUrl}/${app.applicant.file}`;

          // Add hyperlink
          resumeCell.value = {
            text: `Resume_${app.applicant.name}_${app.id}`,
            hyperlink: resumeUrl,
          };

          // Style the hyperlink
          resumeCell.font = {
            color: { argb: "FF0000FF" },
            underline: true,
          };
        }
      });

      // Set response headers for Excel download
      const filename = `general_applications_${new Date().toISOString().split("T")[0]}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobApplicationSubmissionController;
