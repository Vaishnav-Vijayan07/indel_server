const sequelize = require("./config/database");

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
    process.exit(1);
  });
