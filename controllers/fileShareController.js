const Logger = require("winston");
const { models } = require("../models");
const FIleShare = models.FileShare;
const path = require("path");
const fs = require("fs").promises;

class FileShareController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.file = `/uploads/file-share/${req.file.filename}`;
        Logger.info(`Uploaded file: ${data.file}`);
      }

      const files = await FIleShare.create(data);

      res.status(201).json({ success: true, data: files, message: "File created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFiles(req, res, next) {
    try {
      const files = await FIleShare.findAll({
        order: [["order", "ASC"]],
      });
      res.json({ success: true, data: files });
    } catch (error) {
      next(error);
    }
  }

  static async updateFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = await FIleShare.findByPk(id);

      if (!file) {
        if (req.file) {
          const newFilePath = path.join(__dirname, "..", "..", "uploads", "file-share", req.file.filename);
          await fs.unlink(newFilePath).catch(() => {});
        }

        return res.status(404).json({ success: false, message: "File not found" });
      }

      const updateData = { ...req.body };

      // If a new file is uploaded, update the file path
      if (req.file) {
        updateData.file = `/uploads/file-share/${req.file.filename}`;
        Logger.info(`Updated file: ${updateData.file}`);
      }

      // If old file exists, delete it
      if (file.file) {
        const oldFileRelative = file.file.replace("/uploads/", "");
        const oldFilePath = path.join(__dirname, "..", "..", "uploads", oldFileRelative);

        try {
          await fs.access(oldFilePath);
          Logger.info(`Deleting old file: ${oldFilePath}`);
          await fs.unlink(oldFilePath);
          Logger.info(`Deleted old file: ${oldFilePath}`);
        } catch (err) {
          if (err.code === "ENOENT") {
            Logger.warn(`Old file not found, skipping delete: ${oldFilePath}`);
          } else {
            throw err; // rethrow unexpected errors
          }
        }
      }

      await file.update(updateData);
      res.json({ success: true, data: file, message: "File updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = await FIleShare.findByPk(id);
      if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
      }

      if (file.file) {
        const oldFileRelative = file.file.replace("/uploads/", "");
        const oldFilePath = path.join(__dirname, "..", "..", "uploads", oldFileRelative);

        try {
          await fs.access(oldFilePath);
          Logger.info(`Deleting old file: ${oldFilePath}`);
          await fs.unlink(oldFilePath);
          Logger.info(`Deleted old file: ${oldFilePath}`);
        } catch (err) {
          if (err.code === "ENOENT") {
            Logger.warn(`Old file not found, skipping delete: ${oldFilePath}`);
          } else {
            throw err; // rethrow unexpected errors
          }
        }
      }

      await file.destroy();
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FileShareController;
