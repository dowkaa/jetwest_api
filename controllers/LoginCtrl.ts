const utill = require("../utils/packages");
import { Request, Response, NextFunction } from "express";
const db = require("../database/mysql");

const signTokens = (user: any, token: string) => {
  var token: string = utill.jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      conpany_name: user.conpany_name,
      phone_number: user.phone_number,
      otp: user.otp,
    },
    process.env.SECRET,
    {
      expiresIn: 1800,
    }
  );
  var decoded = utill.jwt_decode(token);
  db.dbs.Oauth.create(decoded);
  return token;
};

module.exports = {
  Login: async (req: Request, res: Response, next: NextFunction) => {
    const loginSchema = utill.Joi.object()
      .keys({
        email: utill.Joi.string().required(),
        password: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { email, password } = req.body;

    let user = await db.dbs.Users.findOne({ where: { email } });

    if (!user) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Account does not exist"));
    }

    if (user.reg_status !== "completed") {
      return res.status(400).json({
        status: "ERROR",
        message: "Registration not completed",
        login_status: user.reg_status,
      });
    }

    if (user.activated == 0) {
      const code = user.otp;

      // setTimeout(async () => {
      //   user.otp = null;
      //   await user.save();
      // }, 40000);

      const option = {
        email: user.email,
        name: user.fullname,
        message: `Thanks for joining the Jetwest team, we promise to serve your shiping needs. <br /> Kindly use the token ${code} to activate your account. <br /><br /> Thanks.`,
      };

      try {
        utill.welcome.sendMail(option);
      } catch (error) {
        console.log({ error });
      }

      await utill.helpers.deactivateOtp(email);

      // welcomes.sendMail(option);
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Account has not been activated, kindly activate account with otp code sent to your email"
          )
        );
    }

    if (utill.bcrypt.compareSync(password, user.password)) {
      if (user.locked === 1) {
        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Your account has been locked, kindly contact support",
        });
      }

      let random = utill.uuid();

      const token = signTokens(user, random);
      return res.status(200).json({ success: { token } });
    }

    return res.status(400).json({
      status: "ERROR",
      code: "01",
      message: "Incorrect email or password",
    });
  },

  removeTest: async (req: Request, res: Response, next: NextFunction) => {
    let email = req.query.email;
    let user = await db.dbs.Users.findOne({ where: { email } });
    let quotes = await db.dbs.Quotes.findOne({
      where: { user_id: user.uuid },
    });

    let mail = await db.dbs.Mailing.findOne({
      where: { email: "kaluabel76@gmail.com" },
    });

    let company_info = await db.dbs.CompanyInfo.findOne({
      where: { user_id: user.uuid },
    });

    await company_info.destroy();
    await quotes.destroy();
    await user.destroy();
    await mail.destroy();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("deleted successfully"));
  },
};
