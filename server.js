const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
const apiRoutes = require("./routes/index");
const errorMiddleware = require("./middlewares/errorMiddleware");
const Logger = require("./services/logger");
const path = require("path");
const cors = require("cors");
const { createDemoAdmin } = require("./utils/demoUser");
const { initHomePageContent } = require("./utils/initHomePageContent");
const { initMngmntTeamContent } = require("./utils/initMangementTeamContent");
const { initContactContent } = require("./utils/initContactContent");
const { initHistoryPageContent } = require("./utils/initHistoryPageContent");
const { initIndelValueContent } = require("./utils/initIndelValueContent");
const { initShadesOfIndelContent } = require("./utils/initShadesOfIndelContent");
const { initServicesPageContent } = require("./utils/initServicePageContent");
const { initGoldLoanContent } = require("./utils/initGoldLoanContent");
const { initMsmeLoanContent } = require("./utils/initMsmeLoanContent");
const { initLoanAgainstPropertyContent } = require("./utils/initLoanAgainstPropertyContent");

const { initCdLoanContent } = require("./utils/initCdLoanContent");
const { initCareerContents } = require("./utils/initCareerContent");
const { initDebtPartnersContent, initAboutPageContent, initBlogPageContent, initCSRPageContent } = require("./utils/initContents");
const { initGalleryPageContent } = require("./utils/initGalleryContents");
const { initAwardPageContent } = require("./utils/initAwardPageContent");
const { initNewsPageContent } = require("./utils/initNewsPageContent");
const { initEventPageContent } = require("./utils/initEventPageContent");
const { initInvestorsPageContent } = require("./utils/initInvestorsPageContent");
const { initTestimonialPageContents } = require("./utils/initTestimonialPageContents");
const { initBranchLocatorPageContents } = require("./utils/initBranchLocatorPageContents");
const { initIndelCaresContent } = require("./utils/initIndelCareContent");
const { initFooterContent } = require("./utils/initFooterContent");
const { initHeaderContents } = require("./utils/initHeaderContent");
const { initPopupSettings } = require("./utils/initPopupSettings");
const { initDirectorsContent } = require("./utils/initDirectorsContent");
require("./utils/fileExpiration");
const session = require("express-session");

dotenv.config();
const app = express();

app.set('trust proxy', true);
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only for HTTPS!
      sameSite: "lax", // 'none' for HTTPS and cross-origin
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.get("/set-location", (req, res) => {
  req.session.stateId = 1;
  req.session.stateName = "Kerala";
  res.send("Location stored in session!");
});

app.get("/get-location", (req, res) => {
  res.json({
    stateId: req.session.stateId,
    stateName: req.session.stateName,
  });
});

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true });
    Logger.info("Database connected and synced");

    await createDemoAdmin();
    await initHomePageContent();
    await initAboutPageContent();
    await initMngmntTeamContent();
    await initDebtPartnersContent();
    await initContactContent();
    await initCSRPageContent();
    await initHistoryPageContent();
    await initIndelValueContent();
    await initShadesOfIndelContent();
    await initServicesPageContent();
    await initGoldLoanContent();
    await initMsmeLoanContent();
    await initLoanAgainstPropertyContent();
    await initCdLoanContent();
    await initCareerContents();
    await initBlogPageContent();
    await initGalleryPageContent();
    await initAwardPageContent();
    await initNewsPageContent();
    await initEventPageContent();
    await initInvestorsPageContent();
    await initTestimonialPageContents();
    await initBranchLocatorPageContents();
    await initIndelCaresContent();
    await initFooterContent();
    await initHeaderContents();
    await initPopupSettings();
    await initDirectorsContent();

    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to start server: " + error.message);
    process.exit(1);
  }
};

startServer();
