const { models } = require("../models/index");

const CareerContents = models.CareersContent;

const initCareerContents = async () => {
  try {
    const existingContent = await CareerContents.findOne();

    if (existingContent) {
      console.log("Career content already exists");
      return;
    }

    await CareerContents.create({
      meta_title: "Careers at Our Company",
      meta_description: "Explore exciting career opportunities and join our dynamic team.",
      meta_keywords: "careers, jobs, employment, opportunities",
      page_title: "Careers",
      find_job_title: "Find Your Dream Job",
      find_job_button_name: "Browse Jobs",
      find_job_button_link: "https://example.com/jobs",
      make_your_move_title: "Make Your Move",
      make_your_move_description: "Join us to grow your career and make a difference.",
      make_your_move_image: "https://example.com/career-move.jpg",
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

    console.log("Career content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Career content:", error.message);
  }
};

module.exports = { initCareerContents };
