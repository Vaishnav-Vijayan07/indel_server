const { models } = require("../models/index");

const IndelCaresContent = models.IndelCaresContent;

const initIndelCaresContent = async () => {
    try {
        const existingContent = await IndelCaresContent.findOne();

        if (existingContent) {
            
            return;
        }

        await IndelCaresContent.create({
            page_title: "Indel Cares",
            events_title: "Our Community Initiatives",
        });

        
    } catch (error) {
        console.error("Failed to initialize Indel Cares content:", error.message);
    }
};

module.exports = { initIndelCaresContent };