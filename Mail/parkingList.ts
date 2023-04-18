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
    defaultLayout: "parkingList",
    extName: ".hbs",
  },
  viewPath: __dirname + "/views",
  extName: ".hbs",
};

const sendMail = async (option: any) => {
  await transporter.use("compile", hbs(options));

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: option.email, //"hi@dowkaa.com",
    subject: "Packing List Details",
    template: "parkingList",
    context: {
      name: option.name,
      data: option.ar,
      organisation: option.organisation,
      content: option.content,
      total_weight: option.total_weight,
      bag_no: option.bag_no,
      Shipment_num: option.shipment_num,
      departure: option.departure,
      destination: option.destination,
    },
  };

  const info = await transporter.sendMail(message);
  return info;
};

module.exports = { sendMail };
