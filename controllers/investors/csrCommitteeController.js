const { models } = require("../../models/index");
const { Op } = require("sequelize");
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
      await CacheService.invalidate("webCsrDetails");
      res.status(201).json({ success: true, data: csrCommittee, message: "CSR Committee created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // Legacy path (no pagination params) — backward compatible
      if (!page && !limit) {
        const cacheKey = "CsrCommittee";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const csrCommittees = await CsrCommittee.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(csrCommittees), 3600);
        return res.json({ success: true, data: csrCommittees });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.name = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `CsrCommittee_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await CsrCommittee.findAndCountAll({
        where: whereConditions,
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
      await CacheService.invalidate("webCsrDetails");
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
      await CacheService.invalidate("webCsrDetails");
      await CacheService.invalidate(`csrCommittee_${id}`);
      res.json({ success: true, message: "CSR Committee deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CsrCommitteeController;
