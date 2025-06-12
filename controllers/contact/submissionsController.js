const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const ContactSubmissions = models.ContactSubmissions;

class ContactSubmissionsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const submission = await ContactSubmissions.create(updateData);

      await CacheService.invalidate("contactSubmissions");
      res.status(201).json({ success: true, data: submission, message: "Contact Submission created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "contactSubmissions";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const submissions = await ContactSubmissions.findAll({
        include: [
          {
            model: models.ServiceTypes,
            as: "service_type",
            attributes: ["id", "type_name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(submissions), 3600);
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContactSubmissionsController;
