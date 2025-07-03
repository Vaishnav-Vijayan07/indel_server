const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");

const getStorage = (subfolder) => {
  const uploadPath = path.join("uploads", subfolder);

  // Create subfolder if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
};

const createUploadMiddleware = (subfolder) => {
  return multer({
    storage: getStorage(subfolder),
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|svg|webp|mp4|mov|avi|pdf|xlsx/;

      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if (extname && mimetype) {
        logger.info(`File uploaded: ${file}`);
        logger.info(`File uploaded: ${file.originalname} - ${file.mimetype} - ${file.size} bytes`);
        return cb(null, true);
      }
      logger.warn(`File rejected: ${file.originalname} - ${file.mimetype} - ${file.size} bytes`);
      cb(new CustomError("Images only (jpeg, jpg, png)", 400));
    },
  });
};

module.exports = createUploadMiddleware;
