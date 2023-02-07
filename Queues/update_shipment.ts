const Queue = require("bull");
const Redis = require("ioredis");
const util = require("../utils/packages");
const dd = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("update_shipment", redis);

//process jobs
queue.process(async (job: any) => {
  //console.log('---------------- job is processing --------------');

  await addJob(job.data);
});

// git clone https://dlakes@bitbucket.org/dlakes/lottos.git

const optionz = {
  delay: 100,
  attempts: 1,
};

const processJob = async (data: any) => {
  //Add queue
  queue.add(data, optionz);
};

const addJob = async (data: any) => {
  console.log({ data });
  let shipment = await dd.dbs.ShippingItems.findOne({
    where: {
      uuid: data.uuid,
    },
  })
    .then((res: any) => {
      console.log({ res });
    })
    .catch((err: any) => {
      console.log({ err });
    });

  if (shipment) {
    shipment.progress = "in-transit";
    await shipment.save();
  }
  return;
};

module.exports = {
  processJob,
};
