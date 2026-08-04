const importLocations = require("../seeder/import-locations");

(async () => {
  await importLocations();
  process.exit(0);
})();
