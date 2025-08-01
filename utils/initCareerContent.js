const { models } = require("../models/index");

const CareerContents = models.CareersContent;

const initCareerContents = async () => {
  try {
    const existingContent = await CareerContents.findOne();

    if (existingContent) {
      return;
    }

    await CareerContents.create({
      page_title: "Careers",
      find_job_title: "Find Your Dream Job",
      find_job_button_name: "Browse Jobs",
      find_job_button_link: "https://example.com/jobs",
      make_your_move_title: "Make Your Move",
      make_your_move_description: "Join us to grow your career and make a difference.",
      make_your_move_image: null,
      make_your_move_: "Start Your Journey",
      gallery_title: "Life at Our Company",
      gallery_sub_title: "A Glimpse of Our Culture",
      gallery_description: "Discover our vibrant workplace through these moments.",
      gallery_button_text: "View More",
      gallery_button_link: "https://example.com/gallery",
      benefits_title: "Employee Benefits",
      awards_title: "Our Awards",
      testimonial_title: "What Our Employees Say",
      testimonial_description: "Hear from our team about their experiences.",
      testimonial_button_name: "Read More",
      testimonial_button_link: "https://example.com/testimonials",
    });
  } catch (error) {
    console.error("Failed to initialize Career content:", error.message);
  }
};

module.exports = { initCareerContents };
