// scripts/fileExpiration.js
const { Applicants } = require("../models"); // Adjust path
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const { Op } = require("sequelize");

// Configure mailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Schedule cron job (weekly at midnight IST)
cron.schedule(
  "0 0 * * 0",
  async () => {
    try {
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Find applicants with non-null, expired files
      const expiredApplicants = await Applicants.findAll({
        where: {
          file: { [Op.ne]: null },
          file_uploaded_at: { [Op.lt]: sixMonthsAgo },
          is_active: true,
        },
      });

      if (!expiredApplicants.length) {
        
        return;
      }

      
      for (const applicant of expiredApplicants) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: applicant.email,
          subject: "Resume File Expiration Notice",
          text: `Dear ${
            applicant.name || "Applicant"
          },\n\nYour resume uploaded on ${applicant.file_uploaded_at.toDateString()} has expired. Please upload a new resume for future applications.\n\nBest regards,\nYour Company`,
          html: `
          <p>Dear ${applicant.name || "Applicant"},</p>
          <p>Your resume uploaded on ${applicant.file_uploaded_at.toDateString()} has expired. Please upload a new resume for future applications.</p>
          <p>Best regards,<br>Your Company</p>
        `,
        });

        await applicant.update({ file: null, file_uploaded_at: null });
        
      }
    } catch (error) {
      console.error("Error processing file expiration:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);


