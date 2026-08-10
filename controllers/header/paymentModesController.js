const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const { Op } = require("sequelize");

const PaymentModes = models.PaymentModes;

class PaymentModesController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const paymentMode = await PaymentModes.create(updateData);

      await CacheService.invalidate("paymentModes");
      await CacheService.invalidate("webHeaderContent");
      await CacheService.invalidatePattern("paymentModes_page_*");
      res.status(201).json({ success: true, data: paymentMode, message: "Payment Mode created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "paymentModes";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const paymentModes = await PaymentModes.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(paymentModes), 3600);
        return res.json({ success: true, data: paymentModes });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `paymentModes_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await PaymentModes.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
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
      const cacheKey = `paymentMode_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const paymentMode = await PaymentModes.findByPk(id);
      if (!paymentMode) {
        throw new CustomError("Payment Mode not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(paymentMode), 3600);
      res.json({ success: true, data: paymentMode });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const paymentMode = await PaymentModes.findByPk(id);
      if (!paymentMode) {
        throw new CustomError("Payment Mode not found", 404);
      }

      const updateData = { ...req.body };

      await paymentMode.update(updateData);

      await CacheService.invalidate("paymentModes");
      await CacheService.invalidate("webHeaderContent");
      await CacheService.invalidate(`paymentMode_${id}`);
      await CacheService.invalidatePattern("paymentModes_page_*");
      res.json({ success: true, data: paymentMode, message: "Payment Mode updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const paymentMode = await PaymentModes.findByPk(id);
      if (!paymentMode) {
        throw new CustomError("Payment Mode not found", 404);
      }

      await paymentMode.destroy();

      await CacheService.invalidate("paymentModes");
      await CacheService.invalidate("webHeaderContent");
      await CacheService.invalidate(`paymentMode_${id}`);
      await CacheService.invalidatePattern("paymentModes_page_*");
      res.json({ success: true, message: "Payment Mode deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentModesController;
