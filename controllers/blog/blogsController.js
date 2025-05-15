const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Blogs = models.Blogs;

class BlogsController {
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
      console.log("updateData", updateData);

      if (req.files?.image) {
        updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for Blog: ${updateData.image}`);
      }
      if (req.files?.second_image) {
        updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
        Logger.info(`Uploaded second image for Blog: ${updateData.second_image}`);
      }

      const blog = await Blogs.create(updateData);

      await CacheService.invalidate("blogs");
      res.status(201).json({ success: true, data: blog, message: "Blog created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "blogs";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const blogs = await Blogs.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(blogs), 3600);
      res.json({ success: true, data: blogs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `blog_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const blog = await Blogs.findByPk(id);
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
      res.json({ success: true, data: blog });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const { includeRecent = false } = req.query;
      const cacheKey = `blog:slug:${slug}:${includeRecent}`;

      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const blog = await Blogs.findOne({
        where: { slug, deletedAt: null },
      });
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      let responseData = { blog };
      if (includeRecent) {
        const recentBlogs = await Blogs.findAll({
          where: { is_active: true, deletedAt: null, id: { [Op.ne]: blog.id } },
          order: [["createdAt", "DESC"]],
          limit: 3,
        });
        responseData.recentBlogs = recentBlogs;
      }

      await CacheService.set(cacheKey, JSON.stringify(responseData), 3600);
      res.json({ success: true, data: responseData });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findByPk(id);
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = blog.image;
      let oldSecondImage = blog.second_image;

      if (req.files?.image) {
        updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
        Logger.info(`Updated image for Blog ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await BlogsController.deleteFile(oldImage);
        }
      }
      if (req.files?.second_image) {
        updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
        Logger.info(`Updated second image for Blog ID ${id}: ${updateData.second_image}`);
        if (oldSecondImage) {
          await BlogsController.deleteFile(oldSecondImage);
        }
      }

      await blog.update(updateData);

      await CacheService.invalidate("blogs");
      await CacheService.invalidate(`blog_${id}`);
      res.json({ success: true, data: blog, message: "Blog updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findByPk(id);
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      const oldImage = blog.image;
      const oldSecondImage = blog.second_image;
      await blog.destroy();

      if (oldImage) {
        await BlogsController.deleteFile(oldImage);
      }
      if (oldSecondImage) {
        await BlogsController.deleteFile(oldSecondImage);
      }

      await CacheService.invalidate("blogs");
      await CacheService.invalidate(`blog_${id}`);
      res.json({ success: true, message: "Blog deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BlogsController;
