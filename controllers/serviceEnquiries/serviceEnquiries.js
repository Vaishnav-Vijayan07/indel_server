const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const ServiceEnquiries = models.ServiceEnquiries;

class ServiceEnquiriesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const enquiry = await ServiceEnquiries.create(data);
      await CacheService.invalidate("ServiceEnquiries");

      Logger.info("New Service Enquiry created");
      res.status(201).json({ success: true, data: enquiry, message: "Service Enquiry created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "ServiceEnquiries";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const enquiries = await ServiceEnquiries.findAll({
        order: [["createdAt", "DESC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(enquiries), 3600);
      res.json({ success: true, data: enquiries });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `ServiceEnquiry_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const enquiry = await ServiceEnquiries.findByPk(id);
      if (!enquiry) {
        throw new CustomError("Service Enquiry not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(enquiry), 3600);
      res.json({ success: true, data: enquiry });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const enquiry = await ServiceEnquiries.findByPk(id);

      if (!enquiry) {
        throw new CustomError("Service Enquiry not found", 404);
      }

      await enquiry.update(req.body);
      await CacheService.invalidate("ServiceEnquiries");
      await CacheService.invalidate(`ServiceEnquiry_${id}`);

      Logger.info(`Service Enquiry ID ${id} updated`);
      res.json({ success: true, data: enquiry, message: "Service Enquiry updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const enquiry = await ServiceEnquiries.findByPk(id);

      if (!enquiry) {
        throw new CustomError("Service Enquiry not found", 404);
      }

      await enquiry.destroy();
      await CacheService.invalidate("ServiceEnquiries");
      await CacheService.invalidate(`ServiceEnquiry_${id}`);

      Logger.info(`Service Enquiry ID ${id} deleted`);
      res.json({ success: true, message: "Service Enquiry deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceEnquiriesController;