var exec = require("child_process").exec;
import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const { Op } = require("sequelize");
const db = require("../database/mysql");
require("dotenv").config();

const fundWalletSchema = util.Joi.object()
  .keys({
    reference: util.Joi.string().min(5).required(),
  })
  .unknown();

module.exports = {
  checkTransaction: async (req: any, res: Response, next: NextFunction) => {
    let data = {
      name: "Abel",
      date: "Hello world",
      first_name: "Abel",
    };
    var child = await exec(
      `java -jar Klasha/Klasha.jar ${JSON.stringify(data)}`,
      async function (error: any, stdout: any, stderr: any) {
        console.log({ error, stdout, stderr });

        return stdout;
      }
    );

    console.log({ child });
  },

  paystackPayment: async (req: any, res: Response, next: NextFunction) => {
    const validate = fundWalletSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { reference } = req.body;

    var validateTransaction = await util.helpers.checkUserTransaction(
      reference
    );

    if (validateTransaction) {
      return res
        .status(400)
        .json(util.helpers.sendError("Transaction already entered!"));
    }

    let paystackCheck = await db.dbs.PaytstackStarter.findOne({
      where: { reference: reference },
    });

    if (!paystackCheck) {
      await db.PaytstackStarter.create({
        reference: reference,
        status: "pending",
        user_id: req.user.id,
      });
    }

    var url = `https://api.paystack.co/transaction/verify/${reference}`;

    var option = {
      method: "get",
      url: url,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_LIVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const result = await util.axios(option);
      if (result.data.data.status == "success") {
        var amount = result.data.data.amount / 100;

        var user = await db.User.findOne({ where: { id: req.user.id } });
        var balance = parseFloat(user.wallet) + amount;
        let time = util.moment().format("YYYY-MM-DD HH:mm:ss");

        let deposit = await db.Bonus.findOne({
          where: {
            type: "deposit",
            hide: 0,
            from: {
              [Op.lte]: time,
            },
            to: {
              [Op.gte]: time,
            },
          },
        });

        user.wallet = balance;

        var tranz = await db.Transaction.create({
          user_id: req.user.customer_id,
          amount: amount,
          reference: reference,
          type: "credit",
          method: "paystack",
          balance: balance,
          status: "success",
        });
        await user.save();

        let data = await db.PaytstackStarter.findOne({
          where: { reference: reference },
        });

        if (data) {
          data.status = "success";
          await data.save();
        }

        const option = {
          reference,
          type: "paystack",
        };

        // initialiseOpay.processJob(option);
        util.paystackQueue(option);

        // req.io.emit('update_user', user);
        //send email to customer
        return res
          .status(200)
          .json(util.helpers.sendSuccess("Wallet funded successfully"));
      } else {
        return res
          .status(400)
          .json(
            util.helpers.sendError("Unable to fund wallet. Kindly try again")
          );
      }
    } catch (e: any) {
      return res
        .status(400)
        .json(util.helpers.sendError(e.response.data.message));
    }
  },
};
