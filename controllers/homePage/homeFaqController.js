const { where } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const HomeFaq = models.HomeFaq;

class HomeFaqController {
  static async create(req, res, next) {
    try {
      const faq = await HomeFaq.create(req.body);

      await CacheService.invalidate("homeFaqs");
      await CacheService.invalidate("webHomeData");
      await CacheService.invalidate("webHomeData");

      res.status(201).json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    console.log("api called for faq");
    const { stateId } = req.query;
    try {
      const cacheKey = "homeFaqs";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      let whereClause = { is_active: true };
      if (stateId) {
        whereClause = {
          ...whereClause,
          [Op.or]: [{ state_id: Number(stateId) }, { state_id: null }],
        };
      }

      const faqs = await HomeFaq.findAll({
        order: [["order", "ASC"]],
        where: whereClause,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
        order: [
          [sequelize.literal(`state_id ${stateId ? "= " + Number(stateId) : "IS NULL"}`), "DESC"],
          ["order", "ASC"],
          ["createdAt", "DESC"],
        ],
      });

      await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);
      res.json({ success: true, data: faqs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `homeFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await HomeFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Home FAQ not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(faq), 3600);
      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await HomeFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Home FAQ not found", 404);
      }

      await faq.update(req.body);

      await CacheService.invalidate("homeFaqs");
      await CacheService.invalidate(`homeFaq_${id}`);
      await CacheService.invalidate("webHomeData");

      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await HomeFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Home FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("homeFaqs");
      await CacheService.invalidate(`homeFaq_${id}`);
      await CacheService.invalidate("webHomeData");

      res.json({ success: true, message: "Home FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomeFaqController;
