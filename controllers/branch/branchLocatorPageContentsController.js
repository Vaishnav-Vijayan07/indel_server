const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");

const BranchLocatorPageContents = models.BranchLocatorPageContents;

class BranchLocatorPageContentsController {
  static async get(req, res, next) {
    try {
      const cacheKey = "BranchLocatorPageContents";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const branchLocatorPageContent = await BranchLocatorPageContents.findOne();
      await CacheService.set(cacheKey, JSON.stringify(branchLocatorPageContent), 3600);
      res.json({ success: true, data: branchLocatorPageContent });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const data = { ...req.body };
      let branchLocatorPageContent = await BranchLocatorPageContents.findOne();

      if (branchLocatorPageContent) {
        await branchLocatorPageContent.update(data);
      } else {
        branchLocatorPageContent = await BranchLocatorPageContents.create(data);
      }

      await CacheService.invalidate("BranchLocatorPageContents");
      await CacheService.invalidate("webBranchLocatorData");
      res.json({ success: true, data: branchLocatorPageContent, message: "Branch Locator Page Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BranchLocatorPageContentsController;
