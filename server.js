const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth");
const heroBannerRoutes = require("./routes/heroBanner");
const errorMiddleware = require("./middlewares/errorMiddleware");
const Logger = require("./services/logger");
const path = require("path");
const { createDemoAdmin } = require("./utils/demoUser");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/hero-banners", heroBannerRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    Logger.info("Database connected and synced");

    await createDemoAdmin(); // Create demo admin user

    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to start server: " + error.message);
    process.exit(1);
  }
};

startServer();
