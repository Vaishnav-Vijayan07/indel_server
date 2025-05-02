const { models } = require("../models/index");

const ManagementTeamContent = models.ManagementTeamContent;

const initMngmntTeamContent = async () => {
  try {
    const existingContent = await ManagementTeamContent.findOne();

    if (existingContent) {
      console.log("Management Team Content already exists");
      return;
    }

    await ManagementTeamContent.create({
      title : "This is new title",
      description : "This is new description",
    });

    console.log("Management Team Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Management Team Content:", error.message);
  }
};

module.exports = { initMngmntTeamContent };
