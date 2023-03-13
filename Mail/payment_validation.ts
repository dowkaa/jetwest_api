export {};

const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
require("dotenv").config();

// console.log({
//   pass: process.env.MAIL_PASSWORD,
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   user: process.env.MAIL_USERNAME,
// });

var transporter = nodemailer.createTransport({
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
    defaultLayout: "payment_validation",
    extName: ".hbs",
  },
  viewPath: __dirname + "/views",
  extName: ".hbs",
};

const sendMail = async (option: any) => {
  await transporter.use("compile", hbs(options));

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: option.email,
    subject: "Pending Payment Checkout",
    template: "payment_validation",
    context: {
      name: option.name,
      message: `${option.message}`,
    },
  };

  const info = await transporter.sendMail(message);
  return info;
};

module.exports = { sendMail };
