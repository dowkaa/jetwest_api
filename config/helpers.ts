import { number } from "joi";

const utilities = require("../utils/packages");
const db = require("../database/mysql");

const sendError = (message: string) => {
  var error = {
    status: "ERROR",
    message,
  };

  return error;
};

const checkMail = async (req: any) => {
  return await db.dbs.Users.findOne({ where: { email: req.body.email } });
};

const checkUserTransaction = async (reference: string) => {
  return await db.dbs.Transactions.findOne({ where: { reference: reference } });
};

const deactivateOtp = async (param: string) => {
  if (param.includes("@")) {
    let user = await db.dbs.Users.findOne({ where: { email: param } });

    console.log("Hello world");
    setTimeout(async () => {
      user.otp = null;
      await user.save();
    }, 240000);
  } else {
    let user = await db.dbs.Users.findOne({ where: { mobile_number: param } });

    console.log("11111222222");
    setTimeout(async () => {
      user.otp = null;
      await user.save();
    }, 240000);
  }
};

const checkMobile = async (req: any) => {
  return await db.dbs.Users.findOne({
    where: { mobile_number: req.body.mobile },
  });
};

const timestamp = (async: any) => {
  return (Date.now() / 1000) | 0;
};

const sendSuccess = (message: string) => {
  var success = {
    status: "SUCCESS",
    message,
  };

  return success;
};

const checkPromo = async (code: string) => {
  let checker = await db.dbs.Promotions.findOne({
    where: { code: code },
  });

  if (!checker) {
    const option = {
      message: "Invalid promo code",
      checker,
    };
    return option;
  }

  if (checker.is_active === 0) {
    const option = {
      message: "Promo is not active",
      checker,
    };
    return option;
  }

  let currentDate = Date.now();
  let startDate = Date.parse(checker.startDate);
  let endDate = Date.parse(checker.endDate);

  if (currentDate < startDate) {
    const option = {
      message: "Promo not yet started",
      checker,
    };
    return option;
  }

  if (currentDate >= startDate && currentDate < endDate) {
    const option = {
      message: "Promo is currently ongoing",
      checker,
    };
    return option;
  }

  if (currentDate > endDate && currentDate > startDate) {
    const option = {
      message: "Promo has elapsed",
      checker,
    };
    return option;
  }

  return "invalid";
};

const generateClientId = (length: number) => {
  var result = "";
  var characters = "123456789123456789123456789";
  var charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const generateReftId = (length: number) => {
  var result = "";
  var characters =
    "abcdefghijklmnopqrstuvwxyz1234567891234ABCDEFGHIJKLMNOPQRSTUVWXYZ56789123456789";
  var charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

module.exports = {
  sendError,
  checkUserTransaction,
  generateClientId,
  sendSuccess,
  generateReftId,
  deactivateOtp,
  checkPromo,
  checkMobile,
  timestamp,
  checkMail,
};
