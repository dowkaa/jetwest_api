export {};
const Queue = require("bull");
const Redis = require("ioredis");
const util = require("../utils/packages");
const db = require("../database/mysql");
const updateShipment = require("./update_shipment");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("all-shipments", redis);

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
  //   console.log({ data });

  let shipments = await db.dbs.ShippingItems.findAll({
    where: {
      flight_id: data.uuid,
    },
  });

  for (const item of shipments) {
    console.log({ item });
    updateShipment.processJob(item);
  }
  return;
};

module.exports = {
  processJob,
};
