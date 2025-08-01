const { models } = require("../models/index");

const BranchLocatorPageContents = models.BranchLocatorPageContents;

const initBranchLocatorPageContents = async () => {
  try {
    const existingContent = await BranchLocatorPageContents.findOne();

    if (existingContent) {
      
      return;
    }

    await BranchLocatorPageContents.create({
      meta_title: "Branch Locator | Indel Money",
      meta_description: "Find Indel Money branches near you with our branch locator tool.",
      other_meta_tags: "Find Indel Money branches near you with our branch locator tool.",
      meta_keywords: "branch locator, Indel Money branches, find branches, locations",
      title: "Find Our Branches",
      description:
        "Use our branch locator to discover Indel Money branches across various locations, offering convenient financial services.",
    });

    
  } catch (error) {
    console.error("Failed to initialize Branch Locator Page Contents:", error.message);
  }
};

module.exports = { initBranchLocatorPageContents };
