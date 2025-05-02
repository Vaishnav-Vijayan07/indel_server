const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const ManagementTeams = models.ManagementTeams;

class ManagementTeamsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..","..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.image = `/uploads/management-teams/${req.file.filename}`;
        Logger.info(`Uploaded image for ManagementTeams: ${data.image}`);
      }

      const link = await ManagementTeams.create(data);
      await CacheService.invalidate("ManagementTeams");
      res.status(201).json({ success: true, data: link, message: "Management Teams data created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "ManagementTeams";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const teams = await ManagementTeams.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(teams), 3600);
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `mangementTeam_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const team = await ManagementTeams.findByPk(id);
      if (!team) {
        throw new CustomError("Management Teams data not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(team), 3600);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const team = await ManagementTeams.findByPk(id);
      if (!team) {
        throw new CustomError("Management Teams data not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = team.image;

      if (req.file) {
        updateData.image = `/uploads/management-teams/${req.file.filename}`;
        Logger.info(`Updated image for ManagementTeams ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await ManagementTeamsController.deleteFile(oldImage);
        }
      }

      await team.update(updateData);
      await CacheService.invalidate("ManagementTeams");
      await CacheService.invalidate(`mangementTeam_${id}`);
      res.json({ success: true, data: team,message: "Management Teams data updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const team = await ManagementTeams.findByPk(id);
      if (!team) {
        throw new CustomError("Management Teams data not found", 404);
      }

      const oldImage = team.image;
      await team.destroy();

      if (oldImage) {
        await ManagementTeamsController.deleteFile(oldImage);
      }

      await CacheService.invalidate("ManagementTeams");
      await CacheService.invalidate(`mangementTeam_${id}`);
      res.json({ success: true, message: "Management Teams data deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ManagementTeamsController;
