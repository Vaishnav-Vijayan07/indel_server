const express = require("express");
const router = express.Router();
const WebController = require("../controllers/webController");
const JobApplicationsController = require("../controllers/resumeController");
const createUploadMiddleware = require("../middlewares/multerMiddleware");

const upload = createUploadMiddleware("job-applications");
const uploadField = upload.single("resume");

router.get("/home", WebController.getHomeData);
router.get("/about", WebController.aboutData);
router.get("/management", WebController.mangementData);
router.get("/partners", WebController.partnersData);
router.get("/contacts", WebController.contactData);
router.get("/history", WebController.historyData);
router.get("/blogs", WebController.blogData);
router.get("/blogs/:slug", WebController.blogDetails);
router.get("/indel-values", WebController.IndelValuesData);
router.get("/shades-of-indel", WebController.ShadesOfIndel);
router.get("/our-services", WebController.OurServices);
router.get("/gold-loan", WebController.goldLoan);
router.get("/msme", WebController.MSMELoan);
router.get("/cd-loan", WebController.CDLoan);
router.get("/career", WebController.CareerPage);
router.get("/career-active-jobs", WebController.ActiveJobs);
router.get("/event-gallery", WebController.eventGallery); //Completed
router.get("/awards", WebController.Awards);  //Completed

router.post("/career/resume", uploadField, JobApplicationsController.create);
router.get("/career/resume", uploadField, JobApplicationsController.getAll);

module.exports = router;
