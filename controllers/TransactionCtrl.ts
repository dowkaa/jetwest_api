var exec = require("child_process").exec;
import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const { Op } = require("sequelize");
const { paginate } = require("paginate-info");
const db = require("../database/mysql");
require("dotenv").config();

const fundWalletSchema = util.Joi.object()
  .keys({
    reference: util.Joi.string().min(5).required(),
    departure_date: util.Joi.string().required(),
    arrival_date: util.Joi.string().required(),
    shipment_no: util.Joi.string().required(),
    charged_weight: util.Joi.number().required(),
    pricePerkeg: util.Joi.number().required(),
    shipment_id: util.Joi.number().required(),
    no_of_bags: util.Joi.number().required(),
  })
  .unknown();

let paystack_key: any;

if (process.env.STATE === "dev") {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
} else {
  paystack_key = process.env.PAYSTACK_LIVE_SECRET_KEY;
}
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

    const {
      reference,
      departure_date,
      arrival_date,
      shipment_no,
      charged_weight,
      pricePerkeg,
      no_of_bags,
    } = req.body;

    var validateTransaction = await util.helpers.checkUserTransaction(
      reference
    );

    if (validateTransaction) {
      return res
        .status(400)
        .json(util.helpers.sendError("Transaction already entered!"));
    }

    let paystackCheck = await db.dbs.PaystackStarter.findOne({
      where: { reference: reference },
    });

    if (!paystackCheck) {
      await db.dbs.PaystackStarter.create({
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
        Authorization: `Bearer ${paystack_key}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "application/json",
      },
    };

    try {
      const result = await util.axios(option);
      // .then((res: any) => console.log(res))
      // .catch((err: any) => console.log(err));

      if (result.data.data.status == "success") {
        var amount = result.data.data.amount / 100;

        await db.dbs.Transactions.create({
          user_id: req.user.id,
          amount: amount,
          reference: reference,
          departure_date,
          arrival_date,
          shipment_no,
          weight: charged_weight,
          pricePerkeg,
          no_of_bags,
          type: "credit",
          method: "paystack",
          description: `Payment for shipment with no ${shipment_no}`,
          status: "success",
        });

        let data = await db.dbs.PaystackStarter.findOne({
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
        // util.paystackQueue(option);

        // req.io.emit('update_user', user);
        //send email to customer
        return res
          .status(200)
          .json(util.helpers.sendSuccess("payment successful"));
      } else {
        return res
          .status(400)
          .json(
            util.helpers.sendError("Unable to fund wallet. Kindly try again")
          );
      }
    } catch (e: any) {
      console.log({ e });
      return res.status(400).json(util.helpers.sendError("Error"));
    }
  },

  initializeTransaction: async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    var url = `https://api.paystack.co/transaction/initialize`;

    const data = JSON.stringify({
      amount: 5000,
      email: "abelkelly6022@gmail.com",
    });

    var option = {
      method: "post",
      url: url,
      headers: {
        Authorization: `Bearer ${paystack_key}`,
        "Accept-Encoding": "application/json",
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const result = await util.axios(option);
      console.log({ result, data: result.data.data });
      // if (result.data.data.status == "success") {
      // }
    } catch (e: any) {
      console.log({ e });
    }
  },

  allTransactions: async (req: any, res: Response, next: NextFunction) => {
    const { pageNum } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var transactions = await db.dbs.Transactions.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { user_id: { [Op.or]: [req.user.customer_id, req.user.id] } },
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      `/api/jetwest/transactions/all-transactions?pageNum=` + next_page;
    var prevP =
      `/api/jetwest/transactions/all-transactions?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      transactions.count,
      transactions.rows,
      pageSize
    );

    res.status(200).json({
      status: "SUCCESS",
      data: transactions,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/transactions/all-transactions?pageNum=1`,
      last_page_url:
        `/api/jetwest/transactions/all-transactions?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/transactions/all-transactions?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },
};
