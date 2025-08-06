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
html: `<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>emailer</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css">
body,
html {
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
}
</style>

</head>

<body bgcolor="#fff" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<div style="margin:auto;padding: 45px; width:600px;background: #fff;box-shadow: 0 0 52.7px 0 rgba(0, 0, 0, 0.10);">
<table id="Table_01" width="600px" border="0" cellpadding="0" cellspacing="0" align="center"
style="background: #fff;margin:auto;">
<tbody>
<tr width="100%">
<td width="100%">
<table width="100%" style="margin: auto;">
<tbody>
<tr>
<table width="100%" style="padding: 0px;">
<tbody>
<tr>
<td style="padding: 0px 60px 15px;">
<div
style="width: 95px;height:auto;display: block; margin: 0 auto;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/logomilr1. png"
width="95" height="50" loading="lazy" alt="logo">
</div>
</td>
</tr>
<tr>
<td style="width: 100%;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/line.png"
width="100%" height="1">
</td>
</tr>
</tbody>
</table>
</tr>

<tr>
<td style="padding: 25px 0 0;">
<p style="color: #17479E;
margin-bottom: 15px;
margin-top: 0px;
font-size: 18px;
font-style: normal;
font-weight: 500;
text-align: center;
line-height: 26px;">
Hi jesna sreejith,
</p>
</td>
</tr>
<tr>
<td style="padding: 0 73px 0;">
<p style="color: #001A32;
font-size: 14px;
margin-top: 0px;
text-align: center;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 22px;">
Thank you for your interest in Indel Money. We’ve received your
enquiry and our team will get in touch with you shortly to
assist further. <br>
At Indel Money, we are committed to offering tailored financial
solutions to meet your unique needs — whether it's gold loans,
personal finance, business funding, or investment opportunities.
</p>
<p style="color: #001A32;
font-size: 14px;
text-align: center;
margin-top: 0px;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 26px;">
We look forward to helping you achieve your financial goals.
Warm regards,
</p>
</td>
</tr>
<tr>
<td style="width: 100%;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/line.png"
width="100%" height="1">
</td>
</tr>
<tr>
<td style="margin-top: 30px;">
<table align="center" width="600" border="0" cellpadding="0" cellspacing="0">
<tbody>
<tr>
<td
style="width: auto; text-align: left; margin-right: auto; margin-left: 0;margin-bottom: 40px;">
<p style="color: #17479E;
font-size: 18px;
font-style: normal;
text-align: center;
font-weight: 500;
line-height: 26px;">Registered Office</p>
</td>
</tr>
<tr>
<td style="padding: 0 73px 0;">
<p style="color: #001A32;
font-size: 14px;
margin-top: 0px;
text-align: center;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 26px;">
Indel Money Limited Office No. 301, Floor No. 3,
Sai Arcade,N S Road, Mulund, West Mumbai – 400
080
</p>
</td>
</tr>

</tbody>
</table>
</td>
</tr>
<tr>

<td style="margin: 0px; text-align: right; width:100%; padding: 0;">
<table style="width: 55%;margin: auto;">
<tbody>
<tr>
<td style="width: 35%;">
<table>
<tbody>
<tr>
<td
style="width: 13px; text-align: right; padding: 0px;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/mail2.png"
width="13" height="13"
style="object-fit: contain; margin-top: 3px;">
</td>
<td
style="padding-left: 15px; padding-right: 0px; font-size: 13px; color: #2f2f2f; font-weight: 400; margin: 0px; text-align: left;">

<a href="mailto:support@ dubaiflowerdelivery.com"
style="display: block;font-family: 'Open Sans', sans-serif; text-decoration: none; font-size: 14px; color: #444444; font-weight: 400; margin: 0px; text-align: right;">
care@indelmoney.com
</a>
</td>
</tr>
</tbody>
</table>
</td>
<td style="width: 35%;">
<table>
<tbody>
<tr>
<td style="width: 13px; padding: 0px;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/call2.png"
width="13" height="13"
style="object-fit: contain; margin-top: 3px;">
</td>
<td
style="padding-left: 15px; padding-right: 0px; font-size: 13px; color: #2f2f2f; font-weight: 400; margin: 0px; text-align: right;">
<a href="tel:+1800 4253 990"
style="display: block;font-family: 'Open Sans', sans-serif; text-decoration: none; font-size: 14px; color: #444444; font-weight: 400; margin: 0px; text-align: left;">
1800 4253 990
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="text-align: center;">
<p
style="font-size: 14px; line-height: 1.5; font-weight: 400; text-align: center; font-family: Arial, Helvetica, sans-serif; color: #827C7C; margin: 20px 0 15px;">
Follow Us on
</p>
</td>
</tr>
<tr>
<td style="text-align: center;">
<table border="0" cellpadding="0" cellspacing="0"
style="padding: 0; width: 30%;margin: 0 auto; display: table">
<tbody>
<tr>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 10px;text-decoration: none; display: inline-block;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/facebook.png "
alt="" width="5" height="10">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 15px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/youTube.png"
alt="" width="15" height="10">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 18px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/instagram. png"
alt="" width="12" height="12">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 18px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/linkedIn.png "
alt="" width="11" height="11">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 21px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/x.png"
alt="" width="11" height="11">
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</div>
</body>

</html>
`
  };
  await transporter.sendMail(mailOptions);
};

const enquiryMail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank You for Reaching Out to Indel Money!",
    html: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>emailer</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css">
body,
html {
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
}
</style>

</head>

<body bgcolor="#fff" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<div style="margin:auto;padding: 45px; width:600px;background: #fff;box-shadow: 0 0 52.7px 0 rgba(0, 0, 0, 0.10);">
<table id="Table_01" width="600px" border="0" cellpadding="0" cellspacing="0" align="center"
style="background: #fff;margin:auto;">
<tbody>
<tr width="100%">
<td width="100%">
<table width="100%" style="margin: auto;">
<tbody>
<tr>
<table width="100%" style="padding: 0px;">
<tbody>
<tr>
<td style="padding: 0px 60px 15px;">
<div
style="width: 95px;height:auto;display: block; margin: 0 auto;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/logomilr1. png"
width="95" height="50" loading="lazy" alt="logo">
</div>
</td>
</tr>
<tr>
<td style="width: 100%;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/line.png"
width="100%" height="1">
</td>
</tr>
</tbody>
</table>
</tr>

<tr>
<td style="padding: 25px 0 0;">
<p style="color: #17479E;
margin-bottom: 15px;
margin-top: 0px;
font-size: 18px;
font-style: normal;
font-weight: 500;
text-align: center;
line-height: 26px;">
Hi jesna sreejith,
</p>
</td>
</tr>
<tr>
<td style="padding: 0 73px 0;">
<p style="color: #001A32;
font-size: 14px;
margin-top: 0px;
text-align: center;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 22px;">
Thank you for your interest in Indel Money. We’ve received your
enquiry and our team will get in touch with you shortly to
assist further. <br>
At Indel Money, we are committed to offering tailored financial
solutions to meet your unique needs — whether it's gold loans,
personal finance, business funding, or investment opportunities.
</p>
<p style="color: #001A32;
font-size: 14px;
text-align: center;
margin-top: 0px;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 26px;">
We look forward to helping you achieve your financial goals.
Warm regards,
</p>
</td>
</tr>
<tr>
<td style="width: 100%;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/line.png"
width="100%" height="1">
</td>
</tr>
<tr>
<td style="margin-top: 30px;">
<table align="center" width="600" border="0" cellpadding="0" cellspacing="0">
<tbody>
<tr>
<td
style="width: auto; text-align: left; margin-right: auto; margin-left: 0;margin-bottom: 40px;">
<p style="color: #17479E;
font-size: 18px;
font-style: normal;
text-align: center;
font-weight: 500;
line-height: 26px;">Registered Office</p>
</td>
</tr>
<tr>
<td style="padding: 0 73px 0;">
<p style="color: #001A32;
font-size: 14px;
margin-top: 0px;
text-align: center;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 26px;">
Indel Money Limited Office No. 301, Floor No. 3,
Sai Arcade,N S Road, Mulund, West Mumbai – 400
080
</p>
</td>
</tr>

</tbody>
</table>
</td>
</tr>
<tr>

<td style="margin: 0px; text-align: right; width:100%; padding: 0;">
<table style="width: 55%;margin: auto;">
<tbody>
<tr>
<td style="width: 35%;">
<table>
<tbody>
<tr>
<td
style="width: 13px; text-align: right; padding: 0px;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/mail2.png"
width="13" height="13"
style="object-fit: contain; margin-top: 3px;">
</td>
<td
style="padding-left: 15px; padding-right: 0px; font-size: 13px; color: #2f2f2f; font-weight: 400; margin: 0px; text-align: left;">

<a href="mailto:support@ dubaiflowerdelivery.com"
style="display: block;font-family: 'Open Sans', sans-serif; text-decoration: none; font-size: 14px; color: #444444; font-weight: 400; margin: 0px; text-align: right;">
care@indelmoney.com
</a>
</td>
</tr>
</tbody>
</table>
</td>
<td style="width: 35%;">
<table>
<tbody>
<tr>
<td style="width: 13px; padding: 0px;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/call2.png"
width="13" height="13"
style="object-fit: contain; margin-top: 3px;">
</td>
<td
style="padding-left: 15px; padding-right: 0px; font-size: 13px; color: #2f2f2f; font-weight: 400; margin: 0px; text-align: right;">
<a href="tel:+1800 4253 990"
style="display: block;font-family: 'Open Sans', sans-serif; text-decoration: none; font-size: 14px; color: #444444; font-weight: 400; margin: 0px; text-align: left;">
1800 4253 990
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="text-align: center;">
<p
style="font-size: 14px; line-height: 1.5; font-weight: 400; text-align: center; font-family: Arial, Helvetica, sans-serif; color: #827C7C; margin: 20px 0 15px;">
Follow Us on
</p>
</td>
</tr>
<tr>
<td style="text-align: center;">
<table border="0" cellpadding="0" cellspacing="0"
style="padding: 0; width: 30%;margin: 0 auto; display: table">
<tbody>
<tr>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 10px;text-decoration: none; display: inline-block;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/facebook.png "
alt="" width="5" height="10">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 15px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/youTube.png"
alt="" width="15" height="10">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 18px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/instagram. png"
alt="" width="12" height="12">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 18px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/linkedIn.png "
alt="" width="11" height="11">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 21px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/x.png"
alt="" width="11" height="11">
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</div>
</body>

</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const careerMail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank You for Applying to Indel Money!",
    html: `<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>emailer</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css">
body,
html {
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
}
</style>

</head>

<body bgcolor="#fff" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<div style="margin:auto;padding: 45px; width:600px;background: #fff;box-shadow: 0 0 52.7px 0 rgba(0, 0, 0, 0.10);">
<table id="Table_01" width="600px" border="0" cellpadding="0" cellspacing="0" align="center"
style="background: #fff;margin:auto;">
<tbody>
<tr width="100%">
<td width="100%">
<table width="100%" style="margin: auto;">
<tbody>
<tr>
<table width="100%" style="padding: 0px;">
<tbody>
<tr>
<td style="padding: 0px 60px 15px;">
<div
style="width: 95px;height:auto;display: block; margin: 0 auto;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/logomilr1. png"
width="95" height="50" loading="lazy" alt="logo">
</div>
</td>
</tr>
<tr>
<td style="width: 100%;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/line.png"
width="100%" height="1">
</td>
</tr>
</tbody>
</table>
</tr>

<tr>
<td style="padding: 25px 0 0;">
<p style="color: #17479E;
margin-bottom: 15px;
margin-top: 0px;
font-size: 18px;
font-style: normal;
font-weight: 500;
text-align: center;
line-height: 26px;">
Hi jesna sreejith,
</p>
</td>
</tr>
<tr>
<td style="padding: 0 73px 0;">
<p style="color: #001A32;
font-size: 14px;
margin-top: 0px;
text-align: center;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 22px;">
Thank you for your interest in Indel Money. We’ve received your
enquiry and our team will get in touch with you shortly to
assist further. <br>
At Indel Money, we are committed to offering tailored financial
solutions to meet your unique needs — whether it's gold loans,
personal finance, business funding, or investment opportunities.
</p>
<p style="color: #001A32;
font-size: 14px;
text-align: center;
margin-top: 0px;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 26px;">
We look forward to helping you achieve your financial goals.
Warm regards,
</p>
</td>
</tr>
<tr>
<td style="width: 100%;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/line.png"
width="100%" height="1">
</td>
</tr>
<tr>
<td style="margin-top: 30px;">
<table align="center" width="600" border="0" cellpadding="0" cellspacing="0">
<tbody>
<tr>
<td
style="width: auto; text-align: left; margin-right: auto; margin-left: 0;margin-bottom: 40px;">
<p style="color: #17479E;
font-size: 18px;
font-style: normal;
text-align: center;
font-weight: 500;
line-height: 26px;">Registered Office</p>
</td>
</tr>
<tr>
<td style="padding: 0 73px 0;">
<p style="color: #001A32;
font-size: 14px;
margin-top: 0px;
text-align: center;
margin-bottom: 20px;
font-style: normal;
font-weight: 400;
line-height: 26px;">
Indel Money Limited Office No. 301, Floor No. 3,
Sai Arcade,N S Road, Mulund, West Mumbai – 400
080
</p>
</td>
</tr>

</tbody>
</table>
</td>
</tr>
<tr>

<td style="margin: 0px; text-align: right; width:100%; padding: 0;">
<table style="width: 55%;margin: auto;">
<tbody>
<tr>
<td style="width: 35%;">
<table>
<tbody>
<tr>
<td
style="width: 13px; text-align: right; padding: 0px;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/mail2.png"
width="13" height="13"
style="object-fit: contain; margin-top: 3px;">
</td>
<td
style="padding-left: 15px; padding-right: 0px; font-size: 13px; color: #2f2f2f; font-weight: 400; margin: 0px; text-align: left;">

<a href="mailto:support@ dubaiflowerdelivery.com"
style="display: block;font-family: 'Open Sans', sans-serif; text-decoration: none; font-size: 14px; color: #444444; font-weight: 400; margin: 0px; text-align: right;">
care@indelmoney.com
</a>
</td>
</tr>
</tbody>
</table>
</td>
<td style="width: 35%;">
<table>
<tbody>
<tr>
<td style="width: 13px; padding: 0px;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/call2.png"
width="13" height="13"
style="object-fit: contain; margin-top: 3px;">
</td>
<td
style="padding-left: 15px; padding-right: 0px; font-size: 13px; color: #2f2f2f; font-weight: 400; margin: 0px; text-align: right;">
<a href="tel:+1800 4253 990"
style="display: block;font-family: 'Open Sans', sans-serif; text-decoration: none; font-size: 14px; color: #444444; font-weight: 400; margin: 0px; text-align: left;">
1800 4253 990
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="text-align: center;">
<p
style="font-size: 14px; line-height: 1.5; font-weight: 400; text-align: center; font-family: Arial, Helvetica, sans-serif; color: #827C7C; margin: 20px 0 15px;">
Follow Us on
</p>
</td>
</tr>
<tr>
<td style="text-align: center;">
<table border="0" cellpadding="0" cellspacing="0"
style="padding: 0; width: 30%;margin: 0 auto; display: table">
<tbody>
<tr>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 10px;text-decoration: none; display: inline-block;">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/facebook.png "
alt="" width="5" height="10">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 15px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/youTube.png"
alt="" width="15" height="10">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 18px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/instagram. png"
alt="" width="12" height="12">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 18px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/linkedIn.png "
alt="" width="11" height="11">
</a>
</td>
<td>
<a href="" target="_blank"
style="padding: 0 10px;width: 21px;text-decoration: none; display: inline-block">
<img src="https://ux. intersmarthosting.in/Mailers/ indelmoney/images/x.png"
alt="" width="11" height="11">
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</td>
</tr>

</tbody>
</table>
</div>
</body>

</html>
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
