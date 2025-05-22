const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const CsrCommittee = models.CsrCommittee;

class CsrCommitteeController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const csrCommittee = await CsrCommittee.create(data);
      await CacheService.invalidate("CsrCommittee");
      res.status(201).json({ success: true, data: csrCommittee, message: "CSR Committee created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "CsrCommittee";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csrCommittees = await CsrCommittee.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(csrCommittees), 3600);
      res.json({ success: true, data: csrCommittees });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `csrCommittee_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csrCommittee = await CsrCommittee.findByPk(id);
      if (!csrCommittee) {
        throw new CustomError("CSR Committee not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(csrCommittee), 3600);
      res.json({ success: true, data: csrCommittee });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const csrCommittee = await CsrCommittee.findByPk(id);
      if (!csrCommittee) {
        throw new CustomError("CSR Committee not found", 404);
      }

      const updateData = { ...req.body };
      await csrCommittee.update(updateData);
      await CacheService.invalidate("CsrCommittee");
      await CacheService.invalidate(`csrCommittee_${id}`);
      res.json({ success: true, data: csrCommittee, message: "CSR Committee updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const csrCommittee = await CsrCommittee.findByPk(id);
      if (!csrCommittee) {
        throw new CustomError("CSR Committee not found", 404);
      }

      await csrCommittee.destroy();
      await CacheService.invalidate("CsrCommittee");
      await CacheService.invalidate(`csrCommittee_${id}`);
      res.json({ success: true, message: "CSR Committee deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CsrCommitteeController;
