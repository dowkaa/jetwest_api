export {};
const Queue = require("bull");
const Redis = require("ioredis");
const utils = require("../utils/packages");
const db = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("update_schedule", redis);

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
  let item = await db.dbs.ScheduleFlights.findOne({
    where: { uuid: data.uuid },
  });

  console.log({ minus: Date.parse(item.stod) - Date.now(), id: item.uuid });

  if (Date.parse(item.stod) - Date.now() <= 7200000) {
    item.status = "In progress";
    await item.save();
  }
};

module.exports = {
  processJob,
};
