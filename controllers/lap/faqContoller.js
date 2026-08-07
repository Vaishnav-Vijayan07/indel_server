const { models } = require("../../models");
const CustomError = require("../../utils/customError");
const { Op } = require("sequelize");

const LAPFaq = models.LapFaq;
const States = models.CareerStates;

class LapFaqsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const faq = await LAPFaq.create(updateData);

      res.status(201).json({ success: true, data: faq, message: "Lap FAQ created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    const { page, limit, search, stateId } = req.query;

    try {
      // Legacy path - no pagination params
      if (!page && !limit) {
        const whereClause = {
          ...(stateId && { state_id: Number(stateId) }),
        };

        const faqs = await LAPFaq.findAll({
          where: whereClause,
          include: [{ model: States, attributes: ["state_name"], as: "state" }],
          order: [["order", "ASC"]],
        });

        return res.json({ success: true, data: faqs });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Merge is_active + stateId + search in whereConditions
      const whereConditions = {
        ...(stateId && { state_id: Number(stateId) }),
      };

      // Add search on top
      if (search && search.trim()) {
        whereConditions.question = { [Op.iLike]: `%${search.trim()}%` };
      }

      const { count, rows } = await LAPFaq.findAndCountAll({
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
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const faq = await LAPFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Lap Loan FAQ not found", 404);
      }

      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await LAPFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Lap Loan FAQ not found", 404);
      }

      const updateData = { ...req.body };

      await faq.update(updateData);

      res.json({ success: true, data: faq, message: "Lap FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await LAPFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Lap FAQ not found", 404);
      }

      await faq.destroy();

      res.json({ success: true, message: "Lap FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LapFaqsController;
