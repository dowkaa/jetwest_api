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

  let date = utils.moment().add(1, "hour").format("YYYY-MM-DD");

  let arr = JSON.parse(item.departure_date);
  let arr2 = [];
  let value;
  // let arr2 = [];

  if (arr.length === 1) {
    if (Date.parse(arr[0]) - Date.parse(date) <= 7200000) {
      item.status = "In progress";
      await item.save();
    }
    return;
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (Date.parse(arr[i]) - Date.parse(date) >= 7200000) {
        arr2.push(arr[i]);
      }
    }
    item.departure_date = JSON.stringify(arr2);
    await item.save();
    return;
  }
};

module.exports = {
  processJob,
};
