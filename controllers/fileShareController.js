const { Logger } = require("winston");
const { models } = require("../models");
const fileShare = require("../models/fileShare");
const FIleShare = models.FileShare;

class FileShareController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.file = `/uploads/file-share/${req.file.filename}`;
        Logger.info(`Uploaded file: ${data.file}`);
      }

      const files = await FIleShare.create(updateData);

      res.status(201).json({ success: true, data: files, message: "File created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFiles(req, res, next) {
    try {
      const files = await FIleShare.getAll({
        order: [("order", "ASC")],
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
        return res.status(404).json({ success: false, message: "File not found" });
      }

      const updateData = { ...req.body };
      if (req.file) {
        updateData.file = `/uploads/file-share/${req.file.filename}`;
        Logger.info(`Updated file: ${updateData.file}`);
      }

      if (file.file) {
        const oldFile = file.file.replace("/uploads/", "");
        const absolutePath = path.join(__dirname, "..", "..", "uploads", oldFile);
        await fs.unlink(absolutePath);
        Logger.info(`Deleted old file: ${absolutePath}`);
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
        const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
        await fs.unlink(absolutePath);
        Logger.info(`Deleted file: ${absolutePath}`);
      }

      await file.destroy();
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FileShareController;
