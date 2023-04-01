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
    defaultLayout: "customer_mail",
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
    subject: "Agent and Recipient detials",
    template: "customer_mail",
    context: {
      name: option.name,
      agent_email: option.agent_email,
      agent_first_name: option.agent_first_name,
      agent_last_name: option.agent_last_name,
      agent_mobile: option.agent_mobile,
      agent_company: option.agent_company,
      reciever_firstname: option.reciever_firstname,
      reciever_lastname: option.reciever_lastname,
      reciever_email: option.reciever_email,
      reciever_organisation: option.reciever_organisation,
      reciever_primaryMobile: option.reciever_primaryMobile,
      reciever_secMobile: option.reciever_secMobile,
    },
  };

  const info = await transporter.sendMail(message);
  return info;
};

module.exports = { sendMail };
