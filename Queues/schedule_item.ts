export {};
const Queue = require("bull");
const Redis = require("ioredis");
const utils = require("../utils/packages");
const db = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("first_schedule", redis);

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
  console.log("hello world");
  let payload = await db.dbs.ScheduleFlights.findAll({
    where: { status: "pending" },
  });

  if (payload.length > 0) {
    for (const item of payload) {
      utils.updateScheduled.processJob(item);
    }
  }
  return;
};

module.exports = {
  processJob,
};
