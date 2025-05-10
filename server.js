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
const { initAboutPageContent } = require("./utils/initAboutPageContent");
const { initMngmntTeamContent } = require("./utils/initMangementTeamContent");
const { initDebtPartnersContent } = require("./utils/initDebtPartnersContent");
const { initContactContent } = require("./utils/initContactContent");
const { initHistoryPageContent } = require("./utils/initHistoryPageContent");
const { initIndelValueContent } = require("./utils/initIndelValueContent");
const { initShadesOfIndelContent } = require("./utils/initShadesOfIndelContent");
const { initServicesPageContent } = require("./utils/initServicePageContent");
const { initGoldLoanContent } = require("./utils/initGoldLoanContent");

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

app.use("/api", apiRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    Logger.info("Database connected and synced");

    await createDemoAdmin();
    await initHomePageContent();
    await initAboutPageContent();
    await initMngmntTeamContent();
    await initDebtPartnersContent();
    await initContactContent(),
      await initHistoryPageContent(),
      await initIndelValueContent(),
      await initShadesOfIndelContent(),
      await initServicesPageContent(),
      await initGoldLoanContent();

    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to start server: " + error.message);
    process.exit(1);
  }
};

startServer();
