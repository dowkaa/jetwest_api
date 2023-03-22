export {};

const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
require("dotenv").config();

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
    defaultLayout: "payment_success",
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
    subject: "Successful Payment",
    template: "payment_success",
    context: {
      name: option.name,
      shipment_ref: `${option.shipment_ref}`,
      amount: option.amount,
    },
  };

  const info = await transporter.sendMail(message);
  return info;
};

module.exports = { sendMail };
