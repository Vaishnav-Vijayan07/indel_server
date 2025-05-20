const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const InvestorsContact = models.InvestorsContact;

class InvestorsContactController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const investorsContact = await InvestorsContact.create(data);
      await CacheService.invalidate("InvestorsContact");
      res.status(201).json({ success: true, data: investorsContact, message: "Investors Contact created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "InvestorsContact";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const investorsContacts = await InvestorsContact.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(investorsContacts), 3600);
      res.json({ success: true, data: investorsContacts });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `investorsContact_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const investorsContact = await InvestorsContact.findByPk(id);
      if (!investorsContact) {
        throw new CustomError("Investors Contact not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(investorsContact), 3600);
      res.json({ success: true, data: investorsContact });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const investorsContact = await InvestorsContact.findByPk(id);
      if (!investorsContact) {
        throw new CustomError("Investors Contact not found", 404);
      }

      const updateData = { ...req.body };
      await investorsContact.update(updateData);
      await CacheService.invalidate("InvestorsContact");
      await CacheService.invalidate(`investorsContact_${id}`);
      res.json({ success: true, data: investorsContact, message: "Investors Contact updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const investorsContact = await InvestorsContact.findByPk(id);
      if (!investorsContact) {
        throw new CustomError("Investors Contact not found", 404);
      }

      await investorsContact.destroy();
      await CacheService.invalidate("InvestorsContact");
      await CacheService.invalidate(`investorsContact_${id}`);
      res.json({ success: true, message: "Investors Contact deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InvestorsContactController;