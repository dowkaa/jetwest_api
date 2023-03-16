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

    if (user.type === "Carrier") {
      return res.status(400).json(utill.helpers.sendError("Not allowed"));
    }

    if (user.activated == 0) {
      const code = user.otp;

      // setTimeout(async () => {
      //   user.otp = null;
      //   await user.save();
      // }, 40000);

      const option = {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        message: `Thanks for joining the Dowkaa team, we promise to serve your shiping needs. <br /> Kindly use the token ${code} to activate your account. <br /><br /> Thanks.`,
      };

      try {
        utill.welcome.sendMail(option);
      } catch (error) {
        console.log({ error });
      }

      utill.helpers.deactivateOtp(email);

      await user.save();

      // welcomes.sendMail(option);
      // return res
      //   .status(400)
      //   .json(
      //     utill.helpers.sendError(
      //       "Account has not been activated, kindly activate account with otp code sent to your email"
      //     )
      //   );
    }

    if (utill.bcrypt.compareSync(password, user.password)) {
      if (user.locked === 1) {
        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Your account has been locked, kindly contact support",
        });
      }

      if (user.is_Admin === 1) {
        if (user.status !== "Active") {
          return res.status(400).json({
            status: "ERROR",
            code: "01",
            message:
              "Your account has been deactivated, kindly contact super admin",
          });
        }
      }

      if (user.verification_status === "declined") {
        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Your account has been declined, kindly contact support",
        });
      }

      const opt = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      };

      if (parseInt(user.login_count) === 0) {
        console.log("Hello world");
        utill.introduction.sendMail(opt);
      }
      user.login_count = parseInt(user.login_count) + 1;
      await user.save();

      let random = utill.uuid();

      const token = signTokens(user, random);

      // for company team members login verification
      if (user.invite_status === 0) {
        user.invite_status = 1;
        await user.save();
      }

      if (user.type === "Shipper") {
        var totalCompletedShipments = await db.dbs.ShippingItems.count({
          where: { user_id: user.uuid, status: "completed" },
          order: [["id", "DESC"]],
        });

        var totalCancelled = await db.dbs.ShippingItems.count({
          where: { user_id: user.uuid, status: "cancelled" },
          order: [["id", "DESC"]],
        });

        const totalSuccessfullTransactionsAmount =
          await db.dbs.Transactions.findAll({
            where: { user_id: user.customer_id, status: "success" },
            attributes: [
              [
                utill.sequelize.fn("sum", utill.sequelize.col("amount")),
                "total_amount",
              ],
            ],
            raw: true,
          });

        const totalkg = await db.dbs.ShippingItems.findAll({
          where: { user_id: user.uuid },
          attributes: [
            [
              utill.sequelize.fn(
                "sum",
                utill.sequelize.col("chargeable_weight")
              ),
              "totalKg",
            ],
          ],
          raw: true,
        });

        return res.status(200).json({
          success: {
            token,
            email: user.email,
            login_status: user.reg_status,
            account_type: user.type,
            totalCompletedShipments,
            totalSuccessfullTransactionsAmount,
            totalCancelled,
            totalkg,
          },
        });
      } else {
        return res.status(200).json({
          success: {
            token,
            email: user.email,
            login_status: user.reg_status,
            account_type: user.type,
          },
        });
      }
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
