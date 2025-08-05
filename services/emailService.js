const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Career Form",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

const newsLetterConfirmation = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank You for Subscribing to Indel Money’s Newsletter!",
    text: `
Dear Customer,

Thank you for subscribing to Indel Money’s newsletter!

You’re now part of our mailing list and will receive the latest updates, news, and offers directly to your inbox.

We’re glad to have you with us!

Best regards,  
Team Indel Money  
www.indelmoney.com`,
  };
  await transporter.sendMail(mailOptions);
};

const enquiryMail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank You for Reaching Out to Indel Money!",
    text: `
Hi ${name},

Thank you for contacting Indel Money!

We’ve received your enquiry and our team will get back to you shortly. We appreciate your interest and will make sure to assist you as soon as possible.

If your matter is urgent, please feel free to reach out to us directly via phone or visit our website.

Best regards,  
Team Indel Money  
www.indelmoney.com
    `,
  };

  await transporter.sendMail(mailOptions);
};

const careerMail = async (email, name) => {
  console.log("📨 Sending career mail to:", email, name);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank You for Applying to Indel Money!",
    text: `
Hi ${name},

Thank you for submitting your application to Indel Money!

We’ve successfully received your career form and our HR team will review your application shortly. If your profile matches our requirements, we will get in touch with you for the next steps.

We appreciate your interest in joining Indel Money and wish you all the best in your career.

Warm regards,  
HR Team  
Indel Money  
www.indelmoney.com
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendMailToHRs = async (emails, jobTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails, // can be array of addresses
    subject: "New Job Created Pending Approval",
    text: `Dear HR Team,

A new job titled "${jobTitle}" has been created and is pending your approval.

Please log in to the admin panel to review and approve the job posting.

Best regards,
Your Team`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, newsLetterConfirmation, enquiryMail, careerMail, sendMailToHRs };
