const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const PaymentModes = models.PaymentModes;

class PaymentModesController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const paymentMode = await PaymentModes.create(updateData);

      await CacheService.invalidate("paymentModes");
      await CacheService.invalidate("webHeaderContent");
      res.status(201).json({ success: true, data: paymentMode, message: "Payment Mode created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "paymentModes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const paymentModes = await PaymentModes.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(paymentModes), 3600);
      res.json({ success: true, data: paymentModes });
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
      res.json({ success: true, message: "Payment Mode deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentModesController;
