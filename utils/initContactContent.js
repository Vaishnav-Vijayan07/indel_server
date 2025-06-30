const { models } = require("../models/index");

const ContactContent = models.ContactContent;

const initContactContent = async () => {
  try {
    const existingContent = await ContactContent.findOne();

    if (existingContent) {
      
      return;
    }

    await ContactContent.create({
      title: "Welcome to Contact Page",
      description: "This section helps users reach out to us easily.",
      help_title: "Need Help?",
      toll_free_number: "1800-123-456",
      contact_image: null,
      form_title: "Send Us a Message",
      form_sub_title: "We usually respond within 24 hours.",
      faq_title: "Frequently Asked Questions",
    });

    
  } catch (error) {
    console.error("Failed to initialize contact content:", error.message);
  }
};

module.exports = { initContactContent };
