const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

class JobApplicationSubmissionController {
  static async submitApplication(req, res, next) {
    try {
      const { applicant, job_application } = req.body;
      const file = req.file; // File uploaded via multipart/form-data

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
        // Applicant exists; check for existing application for this job
        const existingApplication = await models.JobApplications.findOne({
          where: {
            applicant_id: newApplicant.id,
            job_id: job_application.job_id,
          },
        });
        if (existingApplication) {
          throw new CustomError("You have already applied for this job", 409);
        }

        // Optionally update applicant data
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
}

module.exports = JobApplicationSubmissionController;
