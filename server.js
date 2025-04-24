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

    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to start server: " + error.message);
    process.exit(1);
  }
};

startServer();
