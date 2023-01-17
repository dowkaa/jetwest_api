export {};
const Queue = require("bull");
const Redis = require("ioredis");
const util = require("../utils/packages");
const db = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("transaction_validate", redis);

//process jobs
queue.process(async (job: any) => {
  //console.log('---------------- job is processing --------------');

  await addJob(job.data);
});
let paystack_key: any;

if (process.env.STATE === "dev") {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
} else {
  paystack_key = process.env.PAYSTACK_LIVE_SECRET_KEY;
}

// git clone https://dlakes@bitbucket.org/dlakes/lottos.git

const options = {
  delay: 100,
  attempts: 1,
};

const processJob = async (data: any) => {
  //Add queue
  queue.add(data, options);
};

const addJob = async (data: any) => {
  var validateTransaction = await util.helpers.checkUserTransaction(
    data.reference
  );

  if (validateTransaction) {
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
    const result = await util.axios(option);

    if (result.data.data.status == "success") {
      var amount = result.data.data.amount / 100;

      let shipment = await db.dbs.ShippingItems.findOne({
        where: { shipment_num: data.shipment_num },
      });

      await db.dbs.Transactions.create({
        user_id: data.customer_id,
        amount: amount,
        reference: data.reference,
        departure_date: shipment.departure_date,
        arrival_date: shipment.arrival_date,
        shipment_no: data.shipment_num,
        weight:
          parseInt(shipment.volumetric_weight) > parseInt(shipment.weigth)
            ? shipment.volumetric_weight
            : shipment.weigth,
        pricePerkeg: shipment.ratePerKg,
        no_of_bags: shipment.no_of_bags,
        type: "credit",
        method: "paystack",
        description: `Payment for shipment with no ${shipment.shipment_no}`,
        status: "success",
      });

      let checker = await db.dbs.PaystackStarter.findOne({
        where: { reference: data.reference },
      });

      if (checker) {
        checker.status = "success";
        await checker.save();
      }

      // const option = {
      //   reference,
      //   type: "paystack",
      // };

      // initialiseOpay.processJob(option);
      // util.paystackQueue(option);

      // req.io.emit('update_user', user);
      //send email to customer
      return;
    } else {
      return;
    }
  } catch (err: any) {
    console.log({ err, message: err.response.data });
    await db.dbs.PaystackError.create({
      uuid: util.uuid(),
      data: JSON.stringify(err),
    });
    return;
  }
};

module.exports = {
  processJob,
};
