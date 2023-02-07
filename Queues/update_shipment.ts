export {};
const Queue = require("bull");
const Redis = require("ioredis");
const util = require("../utils/packages");
const db = require("../database/mysql");
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

queue
  .on("waiting", function (jobId: any) {
    // A Job is waiting to be processed as soon as a worker is idling.
    // workerLogger.info(`Job ${jobId} waiting to be processed `);
  })
  .on("completed", async (job: any, result: any) => {
    // workerLogger.info(`Job ID: ${job.id}, Result: ${result}`);
    console.log({ completed: true, job, result });
    try {
      const jobbed = await queue.getJob(job.id);
      if (jobbed) {
        await jobbed.remove();
        // workerLogger.info(`removed completed job ${job.id}`);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  })
  .on("failed", function (job: any, err: any) {
    console.log({ faild: true, job, err });
    // workerLogger.error("job " + job.id + " in queue failed... " + err);
  })
  .on("error", function (err: any) {
    console.log("Queue Error... " + err);
  })
  .on("stalled", function (job: any) {
    console.log({ stalled: true, job });
  });
// git clone https://dlakes@bitbucket.org/dlakes/lottos.git

const options = {
  delay: 100,
  attempts: 3,
  priority: 1,
};

const processJob = async (data: any) => {
  //Add queue
  queue.add(data, options);
};

const addJob = async (data: any) => {
  console.log({ data });
  let shipment = await db.dbs.ShippingItems.findOne({
    where: {
      uuid: data.uuid,
    },
  });

  console.log({ shipmentProgress: shipment.progress });

  shipment.progress = "in-transit";
  await shipment.save();

  return;
};

module.exports = {
  processJob,
};
