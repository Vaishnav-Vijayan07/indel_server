const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

// Users Controller
class ApplicantsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { preffered_location } = updateData;

      const location = await models.CareerLocations.findByPk(
        preffered_location
      );
      if (!location) {
        throw new CustomError("Preferred location not found", 404);
      }

      const applicant = await models.Applicants.create(updateData);

      await CacheService.invalidate("applicants");
      res
        .status(201)
        .json({ success: true, data: applicant, message: "Applicant created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "applicants";
      const cachedData = await CacheService.get(cacheKey);

      const { preferred_location, limit = "10", offset = "0" } = req.query;

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 10); // Ensure limit >= 1
      const parsedOffset = Math.max(0, parseInt(offset, 10) || 0); // Ensure offset >= 0

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }
      const whereConditions = {};

      if (preferred_location) {
        whereConditions.preferred_location = parseInt(preferred_location);
      }

      const { rows: applicants, count: total } = await models.Applicants.findAndCountAll({
        where: whereConditions,
        include: [{ model: models.CareerLocations, as: "applicantLocation", attributes: ["location_name"] }],
        order: [["created_at", "DESC"]],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      await CacheService.set(cacheKey, JSON.stringify(applicants), 3600);
      res.json({
        success: true,
        data: applicants,
        total,
        meta: {
          page: Math.floor(parsedOffset / parsedLimit) + 1,
          totalPages: Math.ceil(total / parsedLimit),
          limit: parsedLimit,
          offset: parsedOffset,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `applicant_${id}`;
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const applicant = await models.Applicants.findByPk(id, {
        include: [{ model: models.CareerLocations, as: "applicantLocation", attributes: ["location_name"] }],
      });
      if (!applicant) {
        throw new CustomError("Applicant not found", 404);
      }

      // Fetch applied jobs with related job, role, and status details
      const appliedJobs = await models.JobApplications.findAll({
        where: { applicant_id: id },
        include: [
          {
            model: models.CareerJobs,
            as: "job",
            attributes: ["id", "job_title", "location_id", "state_id"],
            include: [
              {
                model: models.CareerRoles,
                as: "role",
                attributes: ["role_name"],
              },
              {
                model: models.CareerLocations,
                as: "location",
                attributes: ["location_name"],
              },
              {
                model: models.CareerStates,
                as: "state",
                attributes: ["state_name"],
              },
            ],
          },
          {
            model: models.ApplicationStatus,
            as: "status",
            attributes: ["status_name"],
          },
        ],
        order: [["application_date", "ASC"]],
      });

      // Format response
      const response = {
        applicant: {
          id: applicant.id,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          location: applicant.location
            ? applicant.location.location_name
            : applicant.current_location || null,
          resume: applicant.file,
        },
        appliedJobs: appliedJobs.map((job) => ({
          id: job.id,
          jobTitle: job.job ? job.job.job_title : null,
          location: job.job ? job.job.location : null,
          state: job.job ? job.job.state : null,
          department: job.job && job.job.role ? job.job.role.role_name : null,
          status: job.status ? job.status.status_name : null,
          appliedDate: job.application_date
            ? job.application_date.toISOString().split("T")[0]
            : null,
        })),
      };

      await CacheService.set(
        cacheKey,
        JSON.stringify(applicant, appliedJobs),
        3600
      );
      res.json({
        success: true,
        data: response,
        message: "Applicant details fetched",
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const applicant = await models.Applicants.findByPk(id);
      if (!applicant) {
        throw new CustomError("Applicant not found", 404);
      }

      const updateData = { ...req.body };

      if (updateData.preffered_location) {
        const location = await models.CareerLocations.findByPk(
          updateData.preffered_location
        );
        if (!location)
          throw new CustomError("Preferred location not found", 404);
      }

      await applicant.update(updateData);

      await Promise.all([
        CacheService.invalidate("applicants"),
        CacheService.invalidate(`applicant_${id}`),
      ]);
      res.json({
        success: true,
        data: applicant,
        message: "Applicant updated",
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const applicant = await models.Applicants.findByPk(id);
      if (!applicant) {
        throw new CustomError("Applicant not found", 404);
      }

      await applicant.destroy();

      await Promise.all([
        CacheService.invalidate("applicants"),
        CacheService.invalidate(`applicant_${id}`),
      ]);
      res.json({ success: true, message: "Applicant deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicantsController;
