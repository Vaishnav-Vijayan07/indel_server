const { models } = require("../models/index");

const IndelCaresContent = models.IndelCaresContent;

const initIndelCaresContent = async () => {
    try {
        const existingContent = await IndelCaresContent.findOne();

        if (existingContent) {
            console.log("Indel Cares content already exists");
            return;
        }

        await IndelCaresContent.create({
            page_title: "Indel Cares",
            events_title: "Our Community Initiatives",
        });

        console.log("Indel Cares content initialized with default values");
    } catch (error) {
        console.error("Failed to initialize Indel Cares content:", error.message);
    }
};

module.exports = { initIndelCaresContent };