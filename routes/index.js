const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Dynamically load all route files in the routes/ directory
const routeFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'));

routeFiles.forEach((file) => {
  const routeName = path.basename(file, '.js');
  const routeModule = require(`./${routeName}`);
  // Mount each route module under its name (e.g., /auth, /hero-banners)
  router.use(`/${routeName.replace(/([A-Z])/g, '-$1').toLowerCase()}`, routeModule);
});

module.exports = router;