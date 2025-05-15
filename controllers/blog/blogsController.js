const { models, Op } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Blogs = models.Blogs;

// Helper function to generate unique slugs
async function generateUniqueSlug(title, excludeId = null) {
  if (!title) {
    throw new CustomError("Title is required for slug generation", 400);
  }

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    slug = "blog-post"; // Fallback slug
  }

  let uniqueSlug = slug;
  let suffix = 1;

  while (
    await Blogs.findOne({
      where: {
        slug: uniqueSlug,
        id: excludeId ? { [Op.ne]: excludeId } : undefined,
      },
    })
  ) {
    uniqueSlug = `${slug}-${suffix}`;
    suffix++;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`Generated unique slug: ${uniqueSlug} for title: ${title}`);
  }

  return uniqueSlug;
}

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
      if (process.env.NODE_ENV !== "production") {
        console.log("updateData", updateData);
      }

      // Validate required fields
      if (!updateData.title) throw new CustomError("Title is required", 400);
      if (!updateData.content) throw new CustomError("Content is required", 400);

      // Generate slug explicitly
      updateData.slug = await generateUniqueSlug(updateData.title);

      // Handle file uploads
      if (req.files?.image) {
        updateData.image = `/Uploads/blogs/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for Blog: ${updateData.image}`);
      }
      if (req.files?.second_image) {
        updateData.second_image = `/Uploads/blogs/${req.files.second_image[0].filename}`;
        Logger.info(`Uploaded second image for Blog: ${updateData.second_image}`);
      }

      // Set defaults
      updateData.is_active = updateData.is_active ?? true;
      updateData.is_slider = updateData.is_slider ?? false;
      updateData.order = updateData.order ?? 0;

      const blog = await Blogs.create(updateData);

      await CacheService.invalidate("blogs:*");
      res.status(201).json({ success: true, data: blog, message: "Blog created" });
    } catch (error) {
      Logger.error(`Create blog failed: ${error.message}`);
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, includeRecent = false } = req.query;
      const offset = (page - 1) * limit;
      const cacheKey = `blogs:${page}:${limit}:${includeRecent}`;

      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const where = { is_active: true };
      const queryOptions = {
        where,
        order: [
          ["order", "ASC"],
          ["createdAt", "DESC"],
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      let responseData = {};
      if (includeRecent) {
        const [blogs, recentBlogs] = await Promise.all([
          Blogs.findAndCountAll(queryOptions),
          Blogs.findAll({
            where: { is_active: true },
            order: [["createdAt", "DESC"]],
            limit: 3,
          }),
        ]);
        responseData = {
          blogs: blogs.rows,
          pagination: {
            total: blogs.count,
            page: parseInt(page),
            limit: parseInt(limit),
          },
          recentBlogs,
        };
      } else {
        const blogs = await Blogs.findAndCountAll(queryOptions);
        responseData = {
          blogs: blogs.rows,
          pagination: {
            total: blogs.count,
            page: parseInt(page),
            limit: parseInt(limit),
          },
        };
      }

      await CacheService.set(cacheKey, JSON.stringify(responseData), 3600);
      res.json({ success: true, data: responseData });
    } catch (error) {
      Logger.error(`Get all blogs failed: ${error.message}`);
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `blog:${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const blog = await Blogs.findOne({
        where: { id },
      });
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
      res.json({ success: true, data: blog });
    } catch (error) {
      Logger.error(`Get blog by ID failed: ${error.message}`);
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
        where: { slug },
      });
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      let responseData = { blog };
      if (includeRecent) {
        const recentBlogs = await Blogs.findAll({
          where: { is_active: true, id: { [Op.ne]: blog.id } },
          order: [["createdAt", "DESC"]],
          limit: 3,
        });
        responseData.recentBlogs = recentBlogs;
      }

      await CacheService.set(cacheKey, JSON.stringify(responseData), 3600);
      res.json({ success: true, data: responseData });
    } catch (error) {
      Logger.error(`Get blog by slug failed: ${error.message}`);
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findOne({
        where: { id },
      });
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = blog.image;
      let oldSecondImage = blog.second_image;

      // Generate new slug if title changes
      if (updateData.title && updateData.title !== blog.title) {
        updateData.slug = await generateUniqueSlug(updateData.title, id);
      }

      // Handle file uploads
      if (req.files?.image) {
        updateData.image = `/Uploads/blogs/${req.files.image[0].filename}`;
        Logger.info(`Updated image for Blog ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await BlogsController.deleteFile(oldImage);
        }
      }
      if (req.files?.second_image) {
        updateData.second_image = `/Uploads/blogs/${req.files.second_image[0].filename}`;
        Logger.info(`Updated second image for Blog ID ${id}: ${updateData.second_image}`);
        if (oldSecondImage) {
          await BlogsController.deleteFile(oldSecondImage);
        }
      }

      await blog.update(updateData);

      await CacheService.invalidate("blogs:*");
      await CacheService.invalidate(`blog:${id}`);
      await CacheService.invalidate(`blog:slug:${blog.slug}`);
      res.json({ success: true, data: blog, message: "Blog updated" });
    } catch (error) {
      Logger.error(`Update blog failed: ${error.message}`);
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findOne({
        where: { id },
      });
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      await blog.destroy(); // Soft delete

      await CacheService.invalidate("blogs:*");
      await CacheService.invalidate(`blog:${id}`);
      await CacheService.invalidate(`blog:slug:${blog.slug}`);
      res.json({ success: true, message: "Blog soft deleted", data: id });
    } catch (error) {
      Logger.error(`Delete blog failed: ${error.message}`);
      next(error);
    }
  }

  static async restore(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findOne({
        where: { id },
        paranoid: false,
      });
      if (!blog || !blog.deletedAt) {
        throw new CustomError("Blog not found or not deleted", 404);
      }

      await blog.restore();

      await CacheService.invalidate("blogs:*");
      await CacheService.invalidate(`blog:${id}`);
      await CacheService.invalidate(`blog:slug:${blog.slug}`);
      res.json({ success: true, message: "Blog restored", data: blog });
    } catch (error) {
      Logger.error(`Restore blog failed: ${error.message}`);
      next(error);
    }
  }
}

module.exports = BlogsController;

// const { models } = require("../../models/index");
// const CacheService = require("../../services/cacheService");
// const CustomError = require("../../utils/customError");
// const Logger = require("../../services/logger");
// const fs = require("fs").promises;
// const path = require("path");

// const Blogs = models.Blogs;

// class BlogsController {
//   static async deleteFile(filePath) {
//     if (!filePath) return;
//     try {
//       const absolutePath = path.join(__dirname, "..", "..", "Uploads", filePath.replace("/uploads/", ""));
//       await fs.unlink(absolutePath);
//       Logger.info(`Deleted file: ${filePath}`);
//     } catch (error) {
//       if (error.code !== "ENOENT") {
//         Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
//       }
//     }
//   }

//   static async create(req, res, next) {
//     try {
//       const updateData = { ...req.body };
//       console.log("updateData", updateData);

//       if (req.files?.image) {
//         updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
//         Logger.info(`Uploaded image for Blog: ${updateData.image}`);
//       }
//       if (req.files?.second_image) {
//         updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
//         Logger.info(`Uploaded second image for Blog: ${updateData.second_image}`);
//       }

//       const blog = await Blogs.create(updateData);

//       await CacheService.invalidate("blogs");
//       res.status(201).json({ success: true, data: blog, message: "Blog created" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getAll(req, res, next) {
//     try {
//       const cacheKey = "blogs";
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const blogs = await Blogs.findAll({
//         order: [["order", "ASC"]],
//       });

//       await CacheService.set(cacheKey, JSON.stringify(blogs), 3600);
//       res.json({ success: true, data: blogs });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getById(req, res, next) {
//     try {
//       const { id } = req.params;
//       const cacheKey = `blog_${id}`;
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const blog = await Blogs.findByPk(id);
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
//       res.json({ success: true, data: blog });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getBySlug(req, res, next) {
//     try {
//       const { slug } = req.params;
//       const { includeRecent = false } = req.query;
//       const cacheKey = `blog:slug:${slug}:${includeRecent}`;

//       const cachedData = await CacheService.get(cacheKey);
//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const blog = await Blogs.findOne({
//         where: { slug, deletedAt: null },
//       });
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       let responseData = { blog };
//       if (includeRecent) {
//         const recentBlogs = await Blogs.findAll({
//           where: { is_active: true, deletedAt: null, id: { [Op.ne]: blog.id } },
//           order: [["createdAt", "DESC"]],
//           limit: 3,
//         });
//         responseData.recentBlogs = recentBlogs;
//       }

//       await CacheService.set(cacheKey, JSON.stringify(responseData), 3600);
//       res.json({ success: true, data: responseData });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async update(req, res, next) {
//     try {
//       const { id } = req.params;
//       const blog = await Blogs.findByPk(id);
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       const updateData = { ...req.body };
//       let oldImage = blog.image;
//       let oldSecondImage = blog.second_image;

//       if (req.files?.image) {
//         updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
//         Logger.info(`Updated image for Blog ID ${id}: ${updateData.image}`);
//         if (oldImage) {
//           await BlogsController.deleteFile(oldImage);
//         }
//       }
//       if (req.files?.second_image) {
//         updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
//         Logger.info(`Updated second image for Blog ID ${id}: ${updateData.second_image}`);
//         if (oldSecondImage) {
//           await BlogsController.deleteFile(oldSecondImage);
//         }
//       }

//       await blog.update(updateData);

//       await CacheService.invalidate("blogs");
//       await CacheService.invalidate(`blog_${id}`);
//       res.json({ success: true, data: blog, message: "Blog updated" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async delete(req, res, next) {
//     try {
//       const { id } = req.params;
//       const blog = await Blogs.findByPk(id);
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       const oldImage = blog.image;
//       const oldSecondImage = blog.second_image;
//       await blog.destroy();

//       if (oldImage) {
//         await BlogsController.deleteFile(oldImage);
//       }
//       if (oldSecondImage) {
//         await BlogsController.deleteFile(oldSecondImage);
//       }

//       await CacheService.invalidate("blogs");
//       await CacheService.invalidate(`blog_${id}`);
//       res.json({ success: true, message: "Blog deleted", data: id });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = BlogsController;
