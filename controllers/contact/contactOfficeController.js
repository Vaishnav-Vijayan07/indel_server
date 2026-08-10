const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const ContactOffice = models.ContactOffice;

class ContactOfficeController {
  static async create(req, res, next) {
    try {
      const faq = await ContactOffice.create(req.body);

      await CacheService.invalidate("ContactOffices");
      res.status(201).json({ success: true, data: faq, message: "Office contact created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // Legacy path - no pagination params
      if (!page && !limit) {
        const cacheKey = "ContactOffices";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const faqs = await ContactOffice.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);
        return res.json({ success: true, data: faqs });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.office_name = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `ContactOffices_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await ContactOffice.findAndCountAll({
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
      const cacheKey = `ContactOffice_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await ContactOffice.findByPk(id);
      if (!faq) {
        throw new CustomError("Office contact not found", 404);
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
      const faq = await ContactOffice.findByPk(id);
      if (!faq) {
        throw new CustomError("Office contact not found", 404);
      }

      await faq.update(req.body);

      await CacheService.invalidate("ContactOffices");
      await CacheService.invalidate(`ContactOffice_${id}`);
      res.json({ success: true, data: faq,message: "Office contact updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await ContactOffice.findByPk(id);
      if (!faq) {
        throw new CustomError("Office contact not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("ContactOffices");
      await CacheService.invalidate(`ContactOffice_${id}`);
      res.json({ success: true, message: "Office contact deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContactOfficeController;
