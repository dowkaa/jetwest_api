const db = require("../database/mysql");
export {};
import { NextFunction, response, Response } from "express";
const utill = require("../utils/packages");
require("dotenv").config();

const checkKey = async (req: any, res: Response, next: NextFunction) => {
  const hasValue = req.headers.hasOwnProperty("apikey");
  let client_key = req.headers.apikey;

  console.log({ req: req.headers, api: req.headers.apikey });

  console.log({ hasValue, client_key });

  if (!hasValue) {
    return res
      .status(401)
      .json(utill.helpers.sendError("Client key is required"));
  }

  if (!client_key) {
    return res
      .status(401)
      .json(utill.helpers.sendError("Client key is required"));
  }

  // return;
  let checker = await db.dbs.ApiKeys.findOne({
    where: { secret: client_key },
  });

  if (!checker) {
    return res.status(401).json(utill.helpers.sendError("Invalid api key"));
  }

  let user = await db.dbs.Users.findOne({ where: { id: checker.user_id } });

  let verifyData = await utill.helpers.validateHarsh(client_key, user.uuid);

  if (!verifyData) {
    return res.status(401).json(utill.helpers.sendError("Invalid api key"));
  }

  if (user.verification_status !== "completed") {
    return res
      .status(401)
      .json(
        utill.helpers.sendError(
          "Account not validated, kindly contact wait for verification or contact api customer service"
        )
      );
  }

  req.user = verifyData;
  next();
};

module.exports = { checkKey };
