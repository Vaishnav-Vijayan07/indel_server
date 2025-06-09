const models = require("../../models");
const CustomError = require("../../utils/customError");
const CacheService = require("../../services/cacheService");

class GeneralApplicationsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { applicant_id, status_id, subcategory_id } = updateData;

      // Validate foreign key references
      const [applicant, status, subcategory] = await Promise.all([
        models.Applicants.findByPk(applicant_id),
        models.ApplicationStatus.findByPk(status_id),
        subcategory_id ? models.JobSubcategory.findByPk(subcategory_id) : Promise.resolve(true),
      ]);

      if (!applicant) throw new CustomError("Applicant not found", 404);
      if (!status) throw new CustomError("Application status not found", 404);
      if (subcategory_id && !subcategory) throw new CustomError("Job subcategory not found", 404);

      const application = await models.GeneralApplications.create(updateData);

      // Invalidate cache
      await CacheService.invalidate("general_applications");
      res.status(201).json({ success: true, data: application, message: "General application created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "general_applications";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const applications = await models.GeneralApplications.findAll({
        where: { is_active: true },
        include: [
          { model: models.Applicants, as: "applicant", attributes: ["name", "email"] },
          { model: models.ApplicationStatus, as: "status", attributes: ["status_name"] },
          { model: models.JobSubcategory, as: "subcategory", attributes: ["subcategory_name"] },
        ],
        order: [
          ["order", "ASC"],
          ["application_date", "DESC"],
        ],
      });

      await CacheService.set(cacheKey, JSON.stringify(applications), 3600);
      res.json({ success: general_applications, data: applications });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `general_application_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const application = await models.GeneralApplications.findByPk(id, {
        include: [
          { model: models.Applicants, as: "applicant", attributes: ["name", "email"] },
          { model: models.ApplicationStatus, as: "status", attributes: ["status_name"] },
          { model: models.JobSubcategory, as: "subcategory", attributes: ["subcategory_name"] },
        ],
      });
      if (!application) {
        throw new CustomError("General application not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(application), 3600);
      res.json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const application = await models.GeneralApplications.findByPk(id);
      if (!application) {
        throw new CustomError("General application not found", 404);
      }

      const updateData = { ...req.body };

      // Validate foreign keys if provided
      if (updateData.applicant_id) {
        const applicant = await models.Applicants.findByPk(updateData.applicant_id);
        if (!applicant) throw new CustomError("Applicant not found", 404);
      }
      if (updateData.status_id) {
        const status = await models.ApplicationStatus.findByPk(updateData.status_id);
        if (!status) throw new CustomError("Application status not found", 404);
      }
      if (updateData.subcategory_id) {
        const subcategory = await models.JobSubcategory.findByPk(updateData.subcategory_id);
        if (!subcategory) throw new CustomError("Job subcategory not found", 404);
      }

      await application.update(updateData);

      // Invalidate caches
      await Promise.all([CacheService.invalidate("general_applications"), CacheService.invalidate(`general_application_${id}`)]);
      res.json({ success: true, data: application, message: "General application updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const application = await models.GeneralApplications.findByPk(id);
      if (!application) {
        throw new CustomError("General application not found", 404);
      }

      await application.destroy();

      // Invalidate caches
      await Promise.all([CacheService.invalidate("general_applications"), CacheService.invalidate(`general_application_${id}`)]);
      res.json({ success: true, message: "General application deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GeneralApplicationsController;
