import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const db = require("../database/mysql");

const signTokens = (user: any, token: string) => {
  var token: string = util.jwt.sign(
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
  var decoded = util.jwt_decode(token);
  db.dbs.Oauth.create(decoded);
  return token;
};

module.exports = {
  forgotPassword: async (
    req: { query: { email: string; mobile: string } },
    res: Response,
    next: NextFunction
  ) => {
    let { email, mobile } = req.query;

    if (email) {
      if (!email || !email.includes("@")) {
        return res
          .status(400)
          .json(util.helpers.sendError("Kindly enter a valid email"));
      }

      let user = await db.dbs.Users.findOne({ where: { email: email } });

      if (!user) {
        return res
          .status(400)
          .json(util.helpers.sendError("No user with this email found"));
      }

      var code = util.helpers.generateClientId(6);

      user.otp = code;
      await user.save();

      let option = {
        email,
        message: `Kindly use the code ${code} to verify your account`,
      };

      util.reset.sendMailer(option);

      return res
        .status(200)
        .json(
          util.helpers.sendSuccess(
            "An otp was sent to your email, kindly use the otp to validate your email"
          )
        );
    } else if (mobile) {
      if (/[a-zA-Z]/.test(mobile)) {
        return res
          .status(400)
          .json(util.helpers.sendError("Kindly enter a valid mobile number"));
      }
      let user = await db.dbs.Users.findOne({
        where: { mobile_number: mobile },
      });

      if (!user) {
        return res.status(400).json(util.helpers.sendError("User not found"));
      }

      if (user.otp) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              "Code already sent, kindly wait for 4 minutes to request another code"
            )
          );
      }

      user.otp = code;
      await user.save();

      const message = `Kindly use the code ${code} to verify your account`;
      // utilz.welcome.sendMail(option);

      //  await utilz.helpers.deactivateOtp(mobile);

      return res
        .status(200)
        .json(
          util.helpers.sendSuccess(
            "An otp was sent to your email, kindly use the otp to validate your email"
          )
        );
    } else {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid query parameter"));
    }
  },

  validatePasswordReset: async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    const loginSchema = util.Joi.object()
      .keys({
        otp: util.Joi.string().required(),
        new_password: util.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { otp, new_password } = req.body;

    let user = await db.dbs.Users.findOne({ where: { otp: otp } });

    if (!user) {
      return res
        .status(400)
        .json(util.helpers.sendError("No user with this otp found"));
    }

    user.password = util.bcrypt.hashSync(new_password);
    await user.save();

    let random = util.uuid();

    const token = signTokens(user, random);

    return res
      .status(200)
      .json({ success: { token }, message: "password successfully changed" });
  },
};
