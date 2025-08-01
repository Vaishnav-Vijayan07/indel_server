const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

// Users Controller
class ApplicantsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { preffered_location } = updateData;

      const location = await models.CareerLocations.findByPk(preffered_location);
      if (!location) {
        throw new CustomError("Preferred location not found", 404);
      }

      const applicant = await models.Applicants.create(updateData);

      await CacheService.invalidate("applicants");
      res.status(201).json({ success: true, data: applicant, message: "Applicant created" });
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
        include: [{ model: models.CareerLocations, as: "location", attributes: ["location_name"] }],
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

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const applicant = await models.Applicants.findByPk(id, {
        include: [{ model: models.CareerLocations, as: "location", attributes: ["location_name"] }],
      });
      if (!applicant) {
        throw new CustomError("Applicant not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(applicant), 3600);
      res.json({ success: true, data: applicant });
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
        const location = await models.CareerLocations.findByPk(updateData.preffered_location);
        if (!location) throw new CustomError("Preferred location not found", 404);
      }

      await applicant.update(updateData);

      await Promise.all([CacheService.invalidate("applicants"), CacheService.invalidate(`applicant_${id}`)]);
      res.json({ success: true, data: applicant, message: "Applicant updated" });
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

      await Promise.all([CacheService.invalidate("applicants"), CacheService.invalidate(`applicant_${id}`)]);
      res.json({ success: true, message: "Applicant deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicantsController;
