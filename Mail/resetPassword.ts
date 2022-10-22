const nodemailers = require("nodemailer");
const hbss = require("nodemailer-express-handlebars");
require("dotenv").config();

var transporter = nodemailers.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  secure: false,
  tls: { rejectUnathorised: false },
});

var options = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: __dirname + "/views",
    defaultLayout: "reset",
    extName: ".hbs",
  },
  viewPath: __dirname + "/views",
  extName: ".hbs",
};

const sendMailer = async (option: any) => {
  await transporter.use("compile", hbss(options));

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: option.email,
    subject: "Password Reset",
    template: "reset",
    context: {
      message: `${option.message}`,
    },
  };

  const info = await transporter.sendMail(message);
  return info;
};

module.exports = { sendMailer };
