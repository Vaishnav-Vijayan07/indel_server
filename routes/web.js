const express = require("express");
const router = express.Router();
const WebController = require("../controllers/webController");
const JobApplicationsController = require("../controllers/resumeController");
const createUploadMiddleware = require("../middlewares/multerMiddleware");
const InvestorsController = require("../controllers/investorsController");
const { validateJobApplicationSubmission } = require("../utils/validator");
const JobApplicationSubmissionController = require("../controllers/career/jobApplicationController");

const upload = createUploadMiddleware("job-applications");
const uploadField = upload.single("resume");
const uploadApplicantFile = upload.single("applicant[file]");

router.get("/home", WebController.getHomeData);
router.get("/about", WebController.aboutData);
router.get("/management", WebController.mangementData);
router.get("/contacts", WebController.contactData);
router.get("/history", WebController.historyData);
router.get("/blogs", WebController.blogData);
router.get("/blogs/:slug", WebController.blogDetails);
router.get("/csr", WebController.CsrData);
router.get("/csr/:slug", WebController.csrDetails);
router.get("/news", WebController.newsData);
router.get("/news/:slug", WebController.newsDetails);
router.get("/indel-values", WebController.IndelValuesData);
router.get("/shades-of-indel", WebController.ShadesOfIndel);
router.get("/our-services", WebController.OurServices);
router.get("/gold-loan", WebController.goldLoan);
router.get("/msme", WebController.MSMELoan);
router.get("/cd-loan", WebController.CDLoan);
router.get("/loan-against-property", WebController.LoanAgainstProperty);
router.get("/career", WebController.CareerPage);
router.get("/career-active-jobs", WebController.ActiveJobs);
router.get("/event-gallery", WebController.eventGallery);
router.get("/event", WebController.event);
router.get("/awards", WebController.Awards);
router.get("/investors/report", InvestorsController.csrReports);
router.get("/investors/contact", InvestorsController.contact);
router.get("/investors/policies", InvestorsController.policies);
router.get("/investors/stock-exchange", InvestorsController.stockExchangeData);
router.get("/investors/fiscal_years", InvestorsController.fiscalyears);
router.get("/investors/corporate-governance", InvestorsController.CorporateGovernence);
router.get("/investors/ncd-reports", InvestorsController.ncdReports);
router.get("/investors/quarterly-reports", InvestorsController.quarterlyReports);
router.get("/investors/credit-ratings", InvestorsController.creditRatings);
router.get("/investors/csr-details", InvestorsController.csrDetails);
router.get("/indel-cares", WebController.indelCares);
router.get("/ombudsman", WebController.ombudsmanFiles);
router.get("/footer", WebController.footerContent);
router.get("/header", WebController.headerContent);
router.get("/popups", WebController.popUps);
router.get("/testimonials", WebController.testimonials);
router.get("/partners", WebController.partners);
router.get("/partner-data", WebController.partnersData);
router.get("/directors", WebController.directors);
router.get("/policies", WebController.policy);

router.post("/career/resume", uploadField, JobApplicationsController.create);
router.get("/career/resume", uploadField, JobApplicationsController.getAll);

router.post(
  "/careers/job_application",
  validateJobApplicationSubmission,
  uploadApplicantFile,
  JobApplicationSubmissionController.submitApplication
);

router.get("/careers/job_applications", JobApplicationSubmissionController.listApplications);

router.post(
  "/careers/general_application",
  validateJobApplicationSubmission,
  uploadApplicantFile,
  JobApplicationSubmissionController.submitGeneralApplication
);

router.get("/careers/general_applications", JobApplicationSubmissionController.listGeneralApplications);
router.post("/careers/send-otp", JobApplicationSubmissionController.sendOtp);
router.post("/careers/verify-otp", JobApplicationSubmissionController.verifyOtp);

module.exports = router;
