const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

function loadRoutes(dirPath, baseRoute = "") {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively load routes in subdirectories
      const newBaseRoute = `${baseRoute}/${file}`;
      loadRoutes(fullPath, newBaseRoute);
    } else if (file !== "index.js" && file.endsWith(".js")) {
      const routeName = path.basename(file, ".js");
      const routePath = `${baseRoute}/${routeName}`
        .replace(/\\/g, "/") // For Windows paths
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();

      const routeModule = require(fullPath);
      router.use(routePath, routeModule);
    }
  });
}

// Start loading from the current directory (where index.js is)
loadRoutes(__dirname);

module.exports = router;
