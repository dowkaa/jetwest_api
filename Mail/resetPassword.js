"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const sendMailer = (option) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.use("compile", hbss(options));
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: option.email,
        subject: "Password Reset",
        template: "reset",
        context: {
            message: `${option.message}`,
        },
    };
    const info = yield transporter.sendMail(message);
    return info;
});
module.exports = { sendMailer };
