const { models } = require("../models/index");

const TestimonialPageContents = models.TestimonialPageContent;

const initTestimonialPageContents = async () => {
  try {
    const existingContent = await TestimonialPageContents.findOne();

    if (existingContent) {
      
      return;
    }

    await TestimonialPageContents.create({
      meta_title: "Testimonials | Indel Money",
      meta_description: "Read testimonials from our valued clients at Indel Money.",
      meta_keywords: "testimonials, client reviews, Indel Money, feedback",
      title: "What Our Clients Say",
    });

    
  } catch (error) {
    console.error("Failed to initialize Testimonial Page Contents:", error.message);
  }
};

module.exports = { initTestimonialPageContents };