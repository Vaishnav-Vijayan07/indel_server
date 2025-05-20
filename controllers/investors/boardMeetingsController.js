const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const BoardMeetings = models.BoardMeetings;

class BoardMeetingsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "Uploads", filePath.replace("/uploads/", ""));
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
      if (req.files) {
        if (req.files.intimation_document) {
          data.intimation_document = `/uploads/investors/board-meetings/${req.files.intimation_document[0].filename}`;
          Logger.info(`Uploaded intimation document: ${data.intimation_document}`);
        }
        if (req.files.outcome_document) {
          data.outcome_document = `/uploads/investors/board-meetings/${req.files.outcome_document[0].filename}`;
          Logger.info(`Uploaded outcome document: ${data.outcome_document}`);
        }
      }

      const boardMeeting = await BoardMeetings.create(data);
      await CacheService.invalidate("BoardMeetings");
      res.status(201).json({ success: true, data: boardMeeting, message: "Board Meeting created" });
    } catch (error) {
      if (req.files) {
        if (req.files.intimation_document) {
          await BoardMeetingsController.deleteFile(`/uploads/investors/board-meetings/${req.files.intimation_document[0].filename}`);
        }
        if (req.files.outcome_document) {
          await BoardMeetingsController.deleteFile(`/uploads/investors/board-meetings/${req.files.outcome_document[0].filename}`);
        }
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "BoardMeetings";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const boardMeetings = await BoardMeetings.findAll({
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
        order: [["meeting_date", "DESC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(boardMeetings), 3600);
      res.json({ success: true, data: boardMeetings });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `boardMeeting_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const boardMeeting = await BoardMeetings.findByPk(id, {
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
      });
      if (!boardMeeting) {
        throw new CustomError("Board Meeting not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(boardMeeting), 3600);
      res.json({ success: true, data: boardMeeting });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const boardMeeting = await BoardMeetings.findByPk(id);
      if (!boardMeeting) {
        throw new CustomError("Board Meeting not found", 404);
      }

      const updateData = { ...req.body };
      const oldIntimation = boardMeeting.intimation_document;
      const oldOutcome = boardMeeting.outcome_document;

      if (req.files) {
        if (req.files.intimation_document) {
          updateData.intimation_document = `/uploads/investors/board-meetings/${req.files.intimation_document[0].filename}`;
          Logger.info(`Updated intimation document for Board Meeting ID ${id}: ${updateData.intimation_document}`);
          if (oldIntimation) {
            await BoardMeetingsController.deleteFile(oldIntimation);
          }
        }
        if (req.files.outcome_document) {
          updateData.outcome_document = `/uploads/investors/board-meetings/${req.files.outcome_document[0].filename}`;
          Logger.info(`Updated outcome document for Board Meeting ID ${id}: ${updateData.outcome_document}`);
          if (oldOutcome) {
            await BoardMeetingsController.deleteFile(oldOutcome);
          }
        }
      }

      await boardMeeting.update(updateData);
      await CacheService.invalidate("BoardMeetings");
      await CacheService.invalidate(`boardMeeting_${id}`);
      res.json({ success: true, data: boardMeeting, message: "Board Meeting updated" });
    } catch (error) {
      if (req.files) {
        if (req.files.intimation_document) {
          await BoardMeetingsController.deleteFile(`/uploads/investors/board-meetings/${req.files.intimation_document[0].filename}`);
        }
        if (req.files.outcome_document) {
          await BoardMeetingsController.deleteFile(`/uploads/investors/board-meetings/${req.files.outcome_document[0].filename}`);
        }
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const boardMeeting = await BoardMeetings.findByPk(id);
      if (!boardMeeting) {
        throw new CustomError("Board Meeting not found", 404);
      }

      const oldIntimation = boardMeeting.intimation_document;
      const oldOutcome = boardMeeting.outcome_document;
      await boardMeeting.destroy();

      if (oldIntimation) {
        await BoardMeetingsController.deleteFile(oldIntimation);
      }
      if (oldOutcome) {
        await BoardMeetingsController.deleteFile(oldOutcome);
      }

      await CacheService.invalidate("BoardMeetings");
      await CacheService.invalidate(`boardMeeting_${id}`);
      res.json({ success: true, message: "Board Meeting deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BoardMeetingsController;