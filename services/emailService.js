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
    subject: "Newsletter Subscription Confirmation",
    text: "Thank you for subscribing to our newsletter! You will receive updates soon.",
  };

  await transporter.sendMail(mailOptions);
};

const enquiryMail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Newsletter Subscription Confirmation",
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
    <div style="margin:auto; width:700px;background: #fff;">
        <table id="Table_01" width="700px" border="0" cellpadding="0" cellspacing="0" align="center"
            style="background: #fff;">
            <tbody>
                <tr width="100%">
                    <td width="100%">
                        <table width="100%" style="margin: auto;">
                            <tbody>
                                <tr>
                                    <td style="padding: 40px 0px 20px">
                                        <h1
                                            style="font-size: 56px;color: #17479E; font-weight: 500; margin: 0px; margin-top: 0px; line-height: 28px; text-align: center;text-transform: capitalize;">
                                            Hi ${name},
                                        </h1>
                                        <p style="color: #2A2A2A;
                                        text-align: center;
                                        margin-bottom: 0;
                                        font-size: 24px;
                                        font-style: normal;
                                        font-weight: 500;
                                        line-height: 60px;">
                                            Your enquiry is recieved, and our team will get back to you.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <table width="100%" style="border-radius: 36px;background: #DCEAFB;padding: 35px;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <p style="color: #17479E;
                                                    margin-bottom: 20px;
                                                    margin-top: 0px;
                                                    font-size: 24px;
                                                    font-style: normal;
                                                    font-weight: 400;
                                                    line-height: 26px;">
                                                        Simply dummy text of the printing
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <p style="color: #001A32; 
                                                    font-size: 18px;
                                                    margin-top: 0px;
                                                    margin-bottom: 20px;
                                                    font-style: normal;
                                                    font-weight: 400;
                                                    line-height: 26px;">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                                        Vestibulum at massa neque. Aliquam mi dui, ultricies vitae
                                                        vehicula at, feugiat et ipsum. Nunc vel ante id neque ultricies
                                                        rutrum nec sed risus. Nunc lacinia in metus ut vehicula.
                                                    </p>
                                                    <p style="color: #001A32; 
                                                    font-size: 18px;
                                                    margin-top: 0px;
                                                    margin-bottom: 20px;
                                                    font-style: normal;
                                                    font-weight: 400;
                                                    line-height: 26px;">
                                                        Lorem Ipsum is simply dummy text of the printing and typesetting
                                                        industry.Lorem Ipsum is simply dummy text of the printing and
                                                        typesetting industry.
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="width: 100%;">
                                                    <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/line.png"
                                                        width="100%" height="1">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="margin-top: 30px;">
                                                    <table align="center" width="600" border="0" cellpadding="0"
                                                        cellspacing="0">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="width: auto; text-align: left; margin-right: auto; margin-left: 0;margin-bottom: 40px;">
                                                                    <p style="color: #17479E;
                                                                    font-size: 20px;
                                                                    font-style: normal;
                                                                    font-weight: 400;
                                                                    line-height: 26px;">Registered Office</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td width="55%"
                                                                    style="padding-left: 0px; text-align: center;">
                                                                    <table align="center" width="100%" border="0"
                                                                        cellpadding="0" cellspacing="0"
                                                                        style="padding: 0;">
                                                                        <tbody>
                                                                            <tr style="margin-bottom: 30px;">
                                                                                <td
                                                                                    style="width: 50px; vertical-align: top; margin-bottom: 30px; padding-top: 4px">
                                                                                    <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/location.png"
                                                                                        width="24" height="24"
                                                                                        alt="Location"
                                                                                        style="object-fit: contain; margin-right: 25px;">
                                                                                </td>
                                                                                <td style="width:50%">
                                                                                    <p
                                                                                        style="width:74%;text-align: left; font-size: 16px; line-height: 20px; margin: 0 ; font-weight: 400; color: #1D1D1D;margin-bottom: 20px;">
                                                                                        Indel Money Limited Office No.
                                                                                        301, Floor No. 3, Sai Arcade, N
                                                                                        S
                                                                                        Road, Mulund, West Mumbai - 400
                                                                                        080
                                                                                    </p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td
                                                                                    style="width: 50px; vertical-align: top; margin-bottom: 30px; padding-top: 4px">
                                                                                    <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/call.png"
                                                                                        width="24" height="24"
                                                                                        alt="call"
                                                                                        style="object-fit: contain; margin-right: 25px;">
                                                                                </td>
                                                                                <td style="width: 95%">
                                                                                    <p
                                                                                        style="margin-top: 0px;margin-bottom: 20px; display: table;">
                                                                                        <a href="tel:1800 4253 990"
                                                                                            style="text-align: left;font-size: 16px; line-height: 26px; margin: 0; font-weight: 400; color: #1D1D1D; text-decoration: none;">1800
                                                                                            4253 990</a>
                                                                                    </p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td
                                                                                    style="width: 50px; vertical-align: top; padding-top: 4px">
                                                                                    <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/mail.png"
                                                                                        width="24" height="24"
                                                                                        alt="mail"
                                                                                        style="object-fit: contain; margin-right: 25px;">
                                                                                </td>
                                                                                <td style="width: 95%">
                                                                                    <a href="mailto:contactus.gis@gemsedu.in"
                                                                                        style="display: block; text-align: left; font-size: 18px; line-height: 26px; margin: 0 ; font-weight: 400; color: #1D1D1D;text-decoration: none;">care@indelmoney.com</a>
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

                                </tr>
                                <tr>
                                    <td width="100%" style="padding: 40px 0px 70px">
                                        <table width="100%" style="margin: auto;margin-top: 30px;">
                                            <tbody>
                                                <tr>
                                                    <td colspan="1" style="text-align: center;">
                                                        <table width="100%" style="text-align: center;" align="center">
                                                            <tr>
                                                                <td style="text-align: left; width: 55%;">
                                                                    <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/logomilr.png"
                                                                        width="200" height="40">
                                                                </td>
                                                                <td>
                                                                    <table style="margin-left: auto;">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>
                                                                                    <table>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td
                                                                                                    style="text-align: left; width: 45%;">
                                                                                                    <p
                                                                                                        style="font-size: 16px;color: #2A2A2A; font-weight: 500; text-transform: uppercase; margin: 0px; margin-top: 0px; line-height: 25px; padding-bottom: 5px;">
                                                                                                        Follow Us on
                                                                                                    </p>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    <table>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td>
                                                                                                    <a href="#!"
                                                                                                        style="display:block;text-decoration: none;width: 13px;">
                                                                                                        <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/facebook.png"
                                                                                                            alt=""
                                                                                                            width="13"
                                                                                                            height="17">
                                                                                                    </a>
                                                                                                </td>
                                                                                                <td
                                                                                                    style="padding-left: 20px;">
                                                                                                    <a href="#!"
                                                                                                        style="display:block;text-decoration: none;">
                                                                                                        <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/youTube.png"
                                                                                                            alt=""
                                                                                                            width="18"
                                                                                                            height="15">
                                                                                                    </a>
                                                                                                </td>
                                                                                                <td
                                                                                                    style="padding-left: 20px;">
                                                                                                    <a href="#!"
                                                                                                        style="display:block;text-decoration: none;">
                                                                                                        <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/instagram.png"
                                                                                                            alt=""
                                                                                                            width="15"
                                                                                                            height="15">
                                                                                                    </a>
                                                                                                </td>
                                                                                                <td
                                                                                                    style="padding-left: 20px;">
                                                                                                    <a href="#!"
                                                                                                        style="display:block;text-decoration: none;">
                                                                                                        <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/linkedIn.png"
                                                                                                            alt=""
                                                                                                            width="15"
                                                                                                            height="16">
                                                                                                    </a>
                                                                                                </td>
                                                                                                <td
                                                                                                    style="padding-left: 20px;">
                                                                                                    <a href="#!"
                                                                                                        style="display:block;text-decoration: none;">
                                                                                                        <img src="https://ux.intersmarthosting.in/Mailers/indelmoney/images/x.png"
                                                                                                            alt=""
                                                                                                            width="15"
                                                                                                            height="16">
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
                                                        </table>
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

</html>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, newsLetterConfirmation, enquiryMail };
