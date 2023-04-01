import { NextFunction, Response } from "express";
const util = require("../utils/packages");
require("dotenv").config();

const personalSignature = (req: any, res: Response, next: NextFunction) => {
  const hasValue = req.headers.hasOwnProperty("signatures");

  //console.log(req.headers);

  if (!hasValue) {
    return res
      .status(400)
      .json(util.helpers.sendError("Signatures header is required"));
  }

  var clientSignature = req.headers.signatures;
  let signatures = process.env.SIGNATURES;

  if (clientSignature !== signatures) {
    return res
      .status(400)
      .json(util.helpers.sendError("Invalid signatures header.."));
  }

  next();
};

module.exports = { personalSignature };
