const { where, Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const cacheService = require("../../services/cacheService");

const HomeFaq = models.HomeFaq;
const States = models.CareerStates;

class HomeFaqController {
  static async create(req, res, next) {
    try {
      // Normalize state_id: empty string or falsy → null, truthy → number
      const body = {
        ...req.body,
        state_id:
          req.body.state_id && req.body.state_id !== ""
            ? Number(req.body.state_id)
            : null,
      };
      const faq = await HomeFaq.create(body);

      await CacheService.invalidate("homeFaqs");
      await CacheService.invalidate("webHomeData");
      await CacheService.invalidate("webHomeData");
      await cacheService.invalidatePattern("homeFaqs_page_*");
      await CacheService.invalidatePattern("homeFaqs_*");
      res.status(201).json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    const { page, limit, search, stateId } = req.query;

    try {
      // Legacy path: unchanged response shape/behavior for backward compatibility
      if (!page && !limit) {
        const cacheKey = `homeFaqs_${stateId || "null"}`;
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        let whereClause = { };
        if (stateId) {
          whereClause = {
            ...whereClause,
            state_id: Number(stateId),
          };
        }

        const faqs = await HomeFaq.findAll({
          where: whereClause,
          include: [{ model: States, attributes: ["state_name"], as: "state" }],
          order: [
            [
              sequelize.literal(
                `state_id ${stateId ? "= " + Number(stateId) : "IS NULL"}`,
              ),
              "DESC",
            ],
            ["order", "ASC"],
            ["createdAt", "DESC"],
          ],
        });

        await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);
        return res.json({ success: true, data: faqs });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      let whereConditions = { };
      if (stateId) {
        whereConditions.state_id = Number(stateId);
      }
      if (search && search.trim()) {
        whereConditions.question = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search
        ? null
        : `homeFaqs_${stateId || "null"}_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await HomeFaq.findAndCountAll({
        where: whereConditions,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
        order: [
          [
            sequelize.literal(
              `state_id ${stateId ? "= " + Number(stateId) : "IS NULL"}`,
            ),
            "DESC",
          ],
          ["order", "ASC"],
          ["createdAt", "DESC"],
        ],
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

      // Normalize state_id: empty string or falsy → null, truthy → number
      const body = {
        ...req.body,
        state_id:
          req.body.state_id && req.body.state_id !== ""
            ? Number(req.body.state_id)
            : null,
      };
      await faq.update(body);

      await CacheService.invalidate("homeFaqs");
      await CacheService.invalidate(`homeFaq_${id}`);
      await CacheService.invalidate("webHomeData");
      await cacheService.invalidatePattern("homeFaqs_page_*");
      await CacheService.invalidatePattern("homeFaqs_*");
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
      await CacheService.invalidatePattern("homeFaqs_*");
      await cacheService.invalidatePattern("homeFaqs_page_*");
      res.json({ success: true, message: "Home FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomeFaqController;
