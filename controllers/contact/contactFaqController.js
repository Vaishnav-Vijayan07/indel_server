const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const ContactFaq = models.ContactFaq;
const States = models.CareerStates;

class ContactFaqController {
  static async create(req, res, next) {
    try {
      const faq = await ContactFaq.create(req.body);

      await CacheService.invalidate("ContactFaqs");
      res.status(201).json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    const { stateId, page, limit, search } = req.query;
    try {
      // Legacy path - no pagination params
      if (!page && !limit) {
        const cacheKey = "ContactFaqs";
        const cachedData = await CacheService.get(cacheKey);

        // if (cachedData) {
        //   return res.json({ success: true, data: JSON.parse(cachedData) });
        // }

        const whereClause = {
          // is_active: true,
          ...(stateId && { state_id: Number(stateId) }),
        };

        const faqs = await ContactFaq.findAll({
          where: whereClause,
          include: [{ model: States, attributes: ["state_name"], as: "state" }],
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);
        return res.json({ success: true, data: faqs });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {
        ...(stateId && { state_id: Number(stateId) }),
      };
      if (search && search.trim()) {
        whereConditions.question = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `ContactFaqs_page_${pageNum}_limit_${limitNum}_state_${stateId || "all"}`;

      const { count, rows } = await ContactFaq.findAndCountAll({
        where: whereConditions,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const response = {
        success: true,
        data: rows,
        total: count,
        pagination: {
          page: pageNum,
          total: count,
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `ContactFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await ContactFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Contact FAQ not found", 404);
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
      const faq = await ContactFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Contact FAQ not found", 404);
      }

      await faq.update(req.body);

      await CacheService.invalidate("ContactFaqs");
      await CacheService.invalidate(`ContactFaq_${id}`);
      res.json({ success: true, data: faq, message: "Contact FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await ContactFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Contact FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("ContactFaqs");
      await CacheService.invalidate(`ContactFaq_${id}`);
      res.json({ success: true, message: "Contact FAQ deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContactFaqController;
