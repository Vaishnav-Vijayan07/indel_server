const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

class JobApplicationSubmissionController {
  static async submitApplication(req, res, next) {
    try {
      const { applicant, job_application } = req.body;
      const file = req.file;

      // Validate foreign key reference for preferred location
      const location = await models.CareerLocations.findByPk(applicant.preferred_location);
      console.log("Preferred location:", location);
      if (!location) {
        throw new CustomError("Preferred location not found", 404);
      }

      // Validate foreign key references for job application
      const [job, status] = await Promise.all([
        models.CareerJobs.findByPk(job_application.job_id),
        models.ApplicationStatus.findByPk(job_application.status_id),
      ]);
      if (!job) throw new CustomError("Job not found", 404);
      if (!status) throw new CustomError("Application status not found", 404);

      // Check if file was uploaded
      if (!file) {
        throw new CustomError("Resume file is required", 400);
      }

      // Check if applicant with this email already exists
      let newApplicant = await models.Applicants.findOne({
        where: { email: applicant.email },
      });

      if (newApplicant) {
        // Applicant exists; optionally update fields if needed
        const applicantData = {
          ...applicant,
          file: file.path, // Update file path if a new file is uploaded
        };
        await newApplicant.update(applicantData);
      } else {
        // Create new applicant record with file path
        const applicantData = {
          ...applicant,
          file: file.path,
        };
        newApplicant = await models.Applicants.create(applicantData);
      }

      // Create job application record with the applicant_id
      const applicationData = {
        ...job_application,
        applicant_id: newApplicant.id,
        file: file.path, // Optionally store the same file path in job_applications
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
      const { role_id, location_id, state_id, status_id, applicant_location_id } = req.query;

      // Build cache key based on query parameters
      const cacheKey = `job_applications_all_${role_id || "all"}_${location_id || "all"}_${state_id || "all"}_${
        status_id || "all"
      }_${applicant_location_id || "all"}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
        });
      }

      // Build filter conditions
      const whereConditions = { is_active: true }; // Only active applications
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

      const applications = await models.JobApplications.findAll({
        where: whereConditions,
        include: [
          {
            model: models.Applicants,
            as: "applicant",
            attributes: ["id", "name", "email", "phone"],
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
      });

      // Store in cache
      await CacheService.set(cacheKey, JSON.stringify(applications), 3600); // Cache for 1 hour

      res.status(200).json({
        status: "success",
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobApplicationSubmissionController;
