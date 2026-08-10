const { Sequelize, Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const PartnersTypes = models.PartnersTypes;

class PartnersTypesController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const partnerType = await PartnersTypes.create(updateData);

      await CacheService.invalidate("partnersTypes");
      await CacheService.invalidatePattern("partnersTypes_page_*");
      res.status(201).json({ success: true, data: partnerType, message: "Partner Type created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "partnersTypes";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const partnersTypes = await PartnersTypes.findAll({
          order: [["order", "ASC"]],
          include: [{ model: models.Partners }],
        });

        await CacheService.set(cacheKey, JSON.stringify(partnersTypes), 3600);
        return res.json({ success: true, data: partnersTypes });
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
      const cacheKey = search ? null : `partnersTypes_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await PartnersTypes.findAndCountAll({
        where: whereConditions,
        include: [{ model: models.Partners }],
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
        distinct: true,
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
      const cacheKey = `partnerType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const partnerType = await PartnersTypes.findByPk(id);
      if (!partnerType) {
        throw new CustomError("Partner Type not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(partnerType), 3600);
      res.json({ success: true, data: partnerType });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const partnerType = await PartnersTypes.findByPk(id);
      if (!partnerType) {
        throw new CustomError("Partner Type not found", 404);
      }

      const updateData = { ...req.body };

      await partnerType.update(updateData);

      await CacheService.invalidate("partnersTypes");
      await CacheService.invalidate(`partnerType_${id}`);
      await CacheService.invalidatePattern("partnersTypes_page_*");
      res.json({ success: true, data: partnerType, message: "Partner Type updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const partnerType = await PartnersTypes.findByPk(id);
      if (!partnerType) {
        throw new CustomError("Partner Type not found", 404);
      }

      const referencingPartners = await models.Partners.findOne({
        where: {
          partner_type_id: id,
        },
      });

      if (referencingPartners) {
        throw new CustomError("Cannot delete Partner Type because it is referenced by existing records in the Partners table", 400);
      }

      await partnerType.destroy();

      await CacheService.invalidate("partnersTypes");
      await CacheService.invalidate(`partnerType_${id}`);
      await CacheService.invalidatePattern("partnersTypes_page_*");
      res.json({ success: true, message: "Partner Type deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PartnersTypesController;
