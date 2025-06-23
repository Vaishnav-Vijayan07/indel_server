const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const { sendOtpEmail } = require("../../services/emailService");
const CustomError = require("../../utils/customError");
const crypto = require("crypto");

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
        console.log("Applicant data:", applicant);

        const preferred_role = await models.GeneralApplications.findOne({
          where: { applicant_id: applicant?.id },
          attributes: ["role_id"],
        });

        console.log("Preferred role:", preferred_role);

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
      const { applicant, job_application } = req.body;
      const file = req.file;

      console.log("File:", file);

      // Validate foreign key reference for preferred location
      const location = await models.CareerLocations.findByPk(applicant.preferred_location);
      console.log("Preferred location:", location);
      if (!location) {
        throw new CustomError("Preferred location not found", 404);
      }

      // Validate foreign key reference for job
      const job = await models.CareerJobs.findByPk(job_application.job_id);
      if (!job) throw new CustomError("Job not found", 404);

      // Fetch "Pending" status
      const pendingStatus = await models.ApplicationStatus.findOne({
        where: { status_name: "Pending" },
      });
      if (!pendingStatus) throw new CustomError("Pending status not found", 500);

      // // Check if file was uploaded
      // if (!file) {
      //   throw new CustomError("Resume file is required", 400);
      // }

      // Check if applicant with this email already exists
      let newApplicant = await models.Applicants.findOne({
        where: { email: applicant.email },
      });

      if (newApplicant) {
        // Check for existing application for this job
        const existingApplication = await models.JobApplications.findOne({
          where: {
            applicant_id: newApplicant.id,
            job_id: job_application.job_id,
          },
        });
        if (existingApplication) {
          throw new CustomError("You have already applied for this job", 409);
        }

        // Update applicant data
        const applicantData = {
          ...applicant,
          ...(file && { file: file?.path }),
        };
        await newApplicant.update(applicantData);
      } else {
        // Create new applicant record with file path
        const applicantData = {
          ...applicant,
          ...(file && { file: file.path }),
        };
        newApplicant = await models.Applicants.create(applicantData);
      }

      // Create job application record with applicant_id, pending status, and auto application date
      const applicationData = {
        job_id: job_application.job_id,
        applicant_id: newApplicant.id,
        status_id: pendingStatus.id,
        is_active: job_application.is_active ?? true, // Default to true if not provided
        order: job_application.order ?? 1, // Default to 1 if not provided
      };
      const newApplication = await models.JobApplications.create(applicationData);

      // Invalidate caches
      await Promise.all([CacheService.invalidate("applicants"), CacheService.invalidate("job_applications")]);

      res.status(201).json({
        success: true,
        data: {
          applicant: newApplicant,
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
      const { role_id, location_id, state_id, status_id, applicant_location_id, limit = "10", offset = "0" } = req.query;

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 10); // Ensure limit >= 1
      const parsedOffset = Math.max(0, parseInt(offset, 10) || 0); // Ensure offset >= 0

      // Build cache key based on query parameters
      const cacheKey = `job_applications_all_${role_id || "all"}_${location_id || "all"}_${state_id || "all"}_${
        status_id || "all"
      }_${applicant_location_id || "all"}_${parsedLimit}_${parsedOffset}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
        });
      }

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
        order: [["created_at", "DESC"]],
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
      const { applicant, general_application } = req.body;
      const file = req?.file;

      // Validate preferred location
      const location = await models.CareerLocations.findByPk(applicant.preferred_location);
      if (!location) throw new CustomError("Preferred location not found", 404);

      // Validate role
      const role = await models.CareerRoles.findByPk(general_application.role_id);
      if (!role) throw new CustomError("Role not found", 404);

      // Get "Pending" status
      const pendingStatus = await models.ApplicationStatus.findOne({
        where: { status_name: "Pending" },
      });
      if (!pendingStatus) throw new CustomError("Pending status not found", 500);

      let applicantRecord = await models.Applicants.findOne({
        where: { email: applicant.email },
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
          where: { applicant_id: applicantRecord.id },
        });

        // Prepare updated data
        const updatedData = {
          ...applicant,
          file: file ? file.path : isFileExpired(applicantRecord) ? null : applicantRecord.file,
          file_uploaded_at: file ? new Date() : isFileExpired(applicantRecord) ? null : applicantRecord.file_uploaded_at,
        };
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
        role_id: general_application.role_id,
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

  // static async submitGeneralApplication(req, res, next) {
  //   try {
  //     const { applicant, general_application } = req.body;
  //     const file = req?.file;

  //     // Validate preferred location
  //     const location = await models.CareerLocations.findByPk(applicant.preferred_location);
  //     if (!location) throw new CustomError("Preferred location not found", 404);

  //     // Validate role
  //     const role = await models.CareerRoles.findByPk(general_application.role_id);
  //     if (!role) throw new CustomError("Role not found", 404);

  //     // Get "Pending" status
  //     const pendingStatus = await models.ApplicationStatus.findOne({
  //       where: { status_name: "Pending" },
  //     });
  //     if (!pendingStatus) throw new CustomError("Pending status not found", 500);

  //     let applicantRecord = await models.Applicants.findOne({
  //       where: { email: applicant.email },
  //     });

  //     if (applicantRecord) {
  //       // Check if any general application already exists for this applicant
  //       const existingApplication = await models.GeneralApplications.findOne({
  //         where: { applicant_id: applicantRecord.id },
  //       });

  //       // If application exists, just update applicant details and return response
  //       if (existingApplication) {
  //         const updatedData = {
  //           ...applicant,
  //           ...(file && { file: file.path }), // Only update file if new one uploaded
  //         };
  //         await applicantRecord.update(updatedData);

  //         return res.status(200).json({
  //           success: true,
  //           data: {
  //             applicant: applicantRecord,
  //             general_application: existingApplication,
  //           },
  //           message: "Application already exists. Details have been updated.",
  //         });
  //       }

  //       // No application yet, create one after updating applicant details
  //       const updatedData = {
  //         ...applicant,
  //         ...(file && { file: file.path }),
  //       };
  //       await applicantRecord.update(updatedData);
  //     } else {
  //       // Create new applicant
  //       const newApplicantData = {
  //         ...applicant,
  //         ...(file && { file: file.path }),
  //       };
  //       applicantRecord = await models.Applicants.create(newApplicantData);
  //     }

  //     // Now create the general application
  //     const newApplication = await models.GeneralApplications.create({
  //       applicant_id: applicantRecord.id,
  //       status_id: pendingStatus.id,
  //       role_id: general_application.role_id,
  //     });

  //     // Invalidate caches
  //     await Promise.all([CacheService.invalidate("applicants"), CacheService.invalidate("general_applications")]);

  //     res.status(201).json({
  //       success: true,
  //       data: {
  //         applicant: applicantRecord,
  //         general_application: newApplication,
  //       },
  //       message: "General application submitted successfully",
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async listGeneralApplications(req, res, next) {
    try {
      const { role_id, location_id, status_id, limit = "10", offset = "0" } = req.query;

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 10); // Ensure limit >= 1
      const parsedOffset = Math.max(0, parseInt(offset, 10) || 0); // Ensure offset >= 0

      // Build cache key based on query parameters
      const cacheKey = `general_applications_all_${role_id || "all"}_${location_id || "all"}_${
        status_id || "all"
      }_${parsedLimit}_${parsedOffset}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
        });
      }

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
}

module.exports = JobApplicationSubmissionController;
