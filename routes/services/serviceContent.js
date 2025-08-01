const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateServicesPageContentUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const ServicesPageContentController = require("../../controllers/services/servicesContentController");

const upload = createUploadMiddleware("service-page-content");
const uploadFields = upload.fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "banner_image",
    maxCount: 1,
  },
  {
    name: "gold_loan_image",
    maxCount: 1,
  },
]);

router.get("/", ServicesPageContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateServicesPageContentUpdate, validateMiddleware, ServicesPageContentController.update);

module.exports = router;
