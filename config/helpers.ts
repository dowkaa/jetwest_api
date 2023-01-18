const utilities = require("../utils/packages");
const db = require("../database/mysql");

const sendError = (message: string) => {
  var error = {
    status: "ERROR",
    message,
  };

  return error;
};

let paystack_key: any;

if (process.env.STATE === "dev") {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
} else {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
}

const checkMail = async (req: any) => {
  return await db.dbs.Users.findOne({ where: { email: req.body.email } });
};

const checkUserTransaction = async (reference: string) => {
  return await db.dbs.Transactions.findOne({ where: { reference: reference } });
};

const validateTransaction = async (data: any) => {
  var validateTransaction = await utilities.helpers.checkUserTransaction(
    data.reference
  );

  if (validateTransaction) {
    console.log("1111111111111111111111111");
    return;
  }

  let paystackCheck = await db.dbs.PaystackStarter.findOne({
    where: { reference: data.reference },
  });

  if (!paystackCheck) {
    await db.dbs.PaystackStarter.create({
      reference: data.reference,
      status: "pending",
      user_id: data.customer_id,
    });
  }

  var url = `https://api.paystack.co/transaction/verify/${data.reference}`;

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
    const result = await utilities.axios(option);

    if (result.data.data.status == "success") {
      var amount = result.data.data.amount / 100;

      let shipment = await db.dbs.ShippingItems.findOne({
        where: { shipment_num: data.shipment_num },
      });

      console.log({
        volumetric_weight: parseFloat(shipment.volumetric_weight),
        weigth: parseInt(shipment.weight),
        weight:
          parseFloat(shipment.volumetric_weight) > parseFloat(shipment.weight)
            ? shipment.volumetric_weight
            : shipment.weight,
      });

      let checkT = await db.dbs.Transactions.findOne({
        where: {
          reference: data.reference,
        },
      });

      if (!checkT) {
        await db.dbs.Transactions.create({
          uuid: utilities.uuid(),
          user_id: data.customer_id,
          amount: amount,
          reference: data.reference,
          departure: shipment.pickup_location,
          arrival: shipment.destination,
          departure_date: shipment.depature_date,
          arrival_date: shipment.arrival_date,
          shipment_no: data.shipment_num,
          weight:
            parseFloat(shipment.volumetric_weight) > parseFloat(shipment.weight)
              ? shipment.volumetric_weight
              : shipment.weight,
          pricePerkeg: shipment.ratePerKg,
          no_of_bags: shipment.no_of_bags,
          type: "credit",
          method: "paystack",
          description: `Payment for shipment with no ${shipment.shipment_num}`,
          status: "success",
        });

        let checker = await db.dbs.PaystackStarter.findOne({
          where: { reference: data.reference },
        });

        if (checker) {
          checker.status = "success";
          await checker.save();
        }
      }

      // const option = {
      //   reference,
      //   type: "paystack",
      // };

      // initialiseOpay.processJob(option);
      // util.paystackQueue(option);

      // req.io.emit('update_user', user);
      //send email to customer
      return "success";
    } else {
      var amount = result.data.data.amount / 100;

      let shipment = await db.dbs.ShippingItems.findOne({
        where: { shipment_num: data.shipment_num },
      });

      console.log({
        volumetric_weight: parseFloat(shipment.volumetric_weight),
        weigth: parseInt(shipment.weight),
        weight:
          parseFloat(shipment.volumetric_weight) > parseFloat(shipment.weight)
            ? shipment.volumetric_weight
            : shipment.weight,
      });

      let checkT = await db.dbs.Transactions.findOne({
        where: {
          reference: data.reference,
        },
      });

      if (!checkT) {
        await db.dbs.Transactions.create({
          uuid: utilities.uuid(),
          user_id: data.customer_id,
          amount: amount,
          reference: data.reference,
          departure: shipment.pickup_location,
          arrival: shipment.destination,
          departure_date: shipment.depature_date,
          arrival_date: shipment.arrival_date,
          shipment_no: data.shipment_num,
          weight:
            parseFloat(shipment.volumetric_weight) > parseFloat(shipment.weight)
              ? shipment.volumetric_weight
              : shipment.weight,
          pricePerkeg: shipment.ratePerKg,
          no_of_bags: shipment.no_of_bags,
          type: "credit",
          method: "paystack",
          description: `Payment for shipment with no ${shipment.shipment_num}`,
          status: "failed",
        });

        let checker = await db.dbs.PaystackStarter.findOne({
          where: { reference: data.reference },
        });

        if (checker) {
          checker.status = "failed";
          await checker.save();
        }
      }
      return "failed";
    }
  } catch (err: any) {
    console.log({ err, message: err.response.data });
    await db.dbs.PaystackError.create({
      uuid: utilities.uuid(),
      data: JSON.stringify(err),
    });

    return "failed";
  }
};

const deactivateOtp = async (param: string) => {
  if (param.includes("@")) {
    let user = await db.dbs.Users.findOne({ where: { email: param } });

    setTimeout(async () => {
      user.otp = null;
      await user.save();
    }, 240000);
  } else {
    let user = await db.dbs.Users.findOne({ where: { mobile_number: param } });

    setTimeout(async () => {
      user.otp = null;
      await user.save();
    }, 240000);
  }
};

const deactivatePassword = async (email: string) => {
  let user = await db.dbs.Users.findOne({ where: { email: email } });

  setTimeout(async () => {
    user.password = null;
    await user.save();
  }, 600000);
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
  validateTransaction,
  checkPromo,
  checkMobile,
  timestamp,
  deactivatePassword,
  checkMail,
};
