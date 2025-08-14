const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "mail.indelmoney.co.in", // your actual mail server
  port: 587, // try 587 for TLS, or 465 for SSL
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // e.g. careers@indelmoney.co.in
    pass: process.env.EMAIL_PASS, // your actual password
  },
  tls: {
    rejectUnauthorized: false, // avoid cert issues if self-signed
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
