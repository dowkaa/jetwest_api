export {};
const Queue = require("bull");
const Redis = require("ioredis");
const util = require("../utils/packages");
const db = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("validate_payment", redis);

//process jobs
queue.process(async (job: any) => {
  //console.log('---------------- job is processing --------------');

  await addJob(job.data);
});

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
  let shipment = await db.dbs.ShippingItems.findOne({
    where: { uuid: data.item.uuid },
  });
  if (shipment) {
    shipment.payment_status = data.response;
    await shipment.save();
  }
  return;
};

module.exports = {
  processJob,
};
