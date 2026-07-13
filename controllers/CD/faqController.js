const { models } = require("../../models");
const CustomError = require("../../utils/customError");

const CDFaq = models.CDFaq;
const States = models.CareerStates;

class CDLoanFaqsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const faq = await CDFaq.create(updateData);

      res.status(201).json({ success: true, data: faq, message: "CD Loan FAQ created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    const { stateId } = req.query;

    try {
      const whereClause = {
        ...(stateId && { state_id: Number(stateId) }),
      };

      const faqs = await CDFaq.findAll({
        where: whereClause,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
        order: [["order", "ASC"]],
      });

      res.json({ success: true, data: faqs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const faq = await CDFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("CD Loan FAQ not found", 404);
      }

      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await CDFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("CD Loan FAQ not found", 404);
      }

      const updateData = { ...req.body };

      await faq.update(updateData);

      res.json({ success: true, data: faq, message: "CD Loan FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await CDFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("CD Loan FAQ not found", 404);
      }

      await faq.destroy();

      res.json({ success: true, message: "CD Loan FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CDLoanFaqsController;
