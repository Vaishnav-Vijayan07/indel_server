const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CustomError = require("../utils/customError");

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
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
};

const createUploadMiddleware = (subfolder) => {
  return multer({
    storage: getStorage(subfolder),
    // fileFilter: (req, file, cb) => {
    //   const filetypes = /jpeg|jpg|png|svg|webp|mp4|mov|avi|pdf|xlsx/;

    //   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //   const mimetype = filetypes.test(file.mimetype);
    //   if (extname && mimetype) {
    //     return cb(null, true);
    //   }
    //   cb(new CustomError("Images only (jpeg, jpg, png)", 400));
    // },
  });
};

module.exports = createUploadMiddleware;
