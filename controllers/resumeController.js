const { models } = require("./../models/index");
const CacheService = require("./../services/cacheService");
const CustomError = require("./../utils/customError");
const Logger = require("./../services/logger");
const fs = require("fs").promises;
const path = require("path");

const JobApplications = models.JobApplications;

class JobApplicationsController {
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
            const updateData = { ...req.body };
            if (req.file) {
                updateData.resume = `/uploads/job-applications/${req.file.filename}`;
                Logger.info(`Uploaded resume for JobApplication: ${updateData.resume}`);
            }

            const application = await JobApplications.create(updateData);

            await CacheService.invalidate("jobApplications");
            res.status(201).json({ success: true, data: application, message: "Job Application created" });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const cacheKey = "jobApplications";
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const applications = await JobApplications.findAll({
                order: [["createdAt", "DESC"]],
            });

            await CacheService.set(cacheKey, JSON.stringify(applications), 3600);
            res.json({ success: true, data: applications });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const cacheKey = `jobApplication_${id}`;
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const application = await JobApplications.findByPk(id);
            if (!application) {
                throw new CustomError("Job Application not found", 404);
            }

            await CacheService.set(cacheKey, JSON.stringify(application), 3600);
            res.json({ success: true, data: application });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const application = await JobApplications.findByPk(id);
            if (!application) {
                throw new CustomError("Job Application not found", 404);
            }

            const updateData = { ...req.body };
            let oldResume = application.resume;

            if (req.file) {
                updateData.resume = `/uploads/job-applications/${req.file.filename}`;
                Logger.info(`Updated resume for JobApplication ID ${id}: ${updateData.resume}`);
                if (oldResume) {
                    await JobApplicationsController.deleteFile(oldResume);
                }
            }

            await application.update(updateData);

            await CacheService.invalidate("jobApplications");
            await CacheService.invalidate(`jobApplication_${id}`);
            res.json({ success: true, data: application, message: "Job Application updated" });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const application = await JobApplications.findByPk(id);
            if (!application) {
                throw new CustomError("Job Application not found", 404);
            }

            const oldResume = application.resume;
            await application.destroy();

            if (oldResume) {
                await JobApplicationsController.deleteFile(oldResume);
            }

            await CacheService.invalidate("jobApplications");
            await CacheService.invalidate(`jobApplication_${id}`);
            res.json({ success: true, message: "Job Application deleted", data: id });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = JobApplicationsController;