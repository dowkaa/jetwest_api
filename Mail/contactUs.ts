const nodemailed = require("nodemailer");
const hbb = require("nodemailer-express-handlebars");
require("dotenv").config();

// console.log({
//   pass: process.env.MAIL_PASSWORD,
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   user: process.env.MAIL_USERNAME,
// });

var transporter = nodemailed.createTransport({
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
    defaultLayout: "contactUs",
    extName: ".hbs",
  },
  viewPath: __dirname + "/views",
  extName: ".hbs",
};

const sendMails = async (option: any) => {
  await transporter.use("compile", hbb(options));

  const message = {
    from: option.email,
    to: "odohfriday9@gmail.com", //"hi@dowkaa.com",
    subject: "Mail from a customer",
    template: "contactUs",
    context: {
      name: option.name,
      message: `${option.message}`,
    },
  };

  const info = await transporter.sendMails(message);
  return info;
};

module.exports = { sendMails };
