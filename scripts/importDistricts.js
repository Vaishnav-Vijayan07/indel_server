const importDistricts = require("../seeder/import-india-districts");

(async()=>{

    await importDistricts();

    process.exit(0);

})();