const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const { default: axios } = require("axios");

const ServiceEnquiries = models.ServiceEnquiries;

class ServiceEnquiriesController {
  // static async create(req, res, next) {
  //   try {
  //     const data = { ...req.body };
  //     const enquiry = await ServiceEnquiries.create(data);
  //     await CacheService.invalidate("ServiceEnquiries");

  //     Logger.info("New Service Enquiry created");
  //     res.status(201).json({ success: true, data: enquiry, message: "Service Enquiry created" });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  static async create(req, res, next) {
    try {
      const { recaptcha, ...data } = req.body;

      console.log("req.body:", req.body);
      

      console.log("data:", data);
      console.log("recaptcha:", recaptcha);
      

      // Validate reCAPTCHA token
      if (!recaptcha) {
        return res.status(400).json({ success: false, message: "reCAPTCHA token is missing" });
      }

      const recaptchaResponse = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
        },
      });

      const { success, score } = recaptchaResponse.data;

      if (!success || score < 0.5) {
        // Adjust score threshold as needed (0.5 is a common threshold for v3)
        return res.status(400).json({
          success: false,
          message: "reCAPTCHA verification failed. Please try again.",
        });
      }

      // Proceed with creating the service enquiry
      const enquiry = await ServiceEnquiries.create(data); // Use data without recaptcha
      await CacheService.invalidate("ServiceEnquiries");

      Logger.info("New Service Enquiry created");
      res.status(201).json({ success: true, data: enquiry, message: "Service Enquiry created" });
    } catch (error) {
      console.error("Error in ServiceEnquiries.create:", error.message || error);
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
        include: [
          {
            model: models.ServiceTypes,
            as: "service_type",
            attributes: ["id", "type_name"],
          },
        ],
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
