export {};
const Queue = require("bull");
const Redis = require("ioredis");
const db = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("second_mail", redis);

//process jobs
queue.process(async (job: any) => {
  //console.log('---------------- job is processing --------------');

  await addJob(job.data);
});

// git clone https://dlakes@bitbucket.org/dlakes/lottos.git

const options = {
  delay: 3600000,
  attempts: 1,
};

const processJob = async (data: any) => {
  //Add queue
  queue.add(data, options);
};

const addJob = async (data: any) => {
  // console.log(data);
  // console.log(data);
  // console.log(data);
  // console.log(data);
  let users = await db.dbs.Users.findAll();

  for (const item of users) {
    // console.log(x)
  }

  return;
};

module.exports = {
  processJob,
};
