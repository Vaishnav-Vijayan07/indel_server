const { models } = require("../../models");
const CustomError = require("../../utils/customError");

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
    const { stateId } = req.query;

    try {
      const whereClause = {
        ...(stateId && { state_id: Number(stateId) }),
      };

      const faqs = await LAPFaq.findAll({
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
