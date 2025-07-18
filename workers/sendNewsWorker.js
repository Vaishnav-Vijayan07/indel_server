const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async ({ emails, text, subject, html }) => {
  const mailOptions = {
    from: `"Indel Money" <${process.env.EMAIL_USER}>`,
    to: emails,
    text,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    accepted: info.accepted,
    rejected: info.rejected,
    messageId: info.messageId,
  };
};
