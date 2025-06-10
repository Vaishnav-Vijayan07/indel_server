const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

class JobApplicationSubmissionController {
  static async submitApplication(req, res, next) {
    try {
      const { applicant, job_application } = req.body;
      const file = req.file;

      const location = await models.CareerLocations.findByPk(applicant.preferred_location);

      console.log("Preferred location:", location);

      if (!location) {
        throw new CustomError("Preferred location not found", 404);
      }

      // Check if file was uploaded and set the file path
      if (!file) {
        throw new CustomError("Resume file is required", 400);
      }

      // Validate foreign key references for job application
      const [job, status] = await Promise.all([
        models.CareerJobs.findByPk(job_application.job_id),
        models.ApplicationStatus.findByPk(job_application.status_id),
      ]);
      if (!job) throw new CustomError("Job not found", 404);
      if (!status) throw new CustomError("Application status not found", 404);

      // Add file path to applicant data
      const applicantData = {
        ...applicant,
        file: file.path, // Store the file path from req.file
      };

      // Create applicant record
      const newApplicant = await models.Applicants.create(applicantData);

      // Create job application record with the new applicant_id
      const applicationData = {
        ...job_application,
        applicant_id: newApplicant.id,
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
}

module.exports = JobApplicationSubmissionController;
