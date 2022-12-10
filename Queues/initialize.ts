export {};
const Queue = require("bull");
const Redis = require("ioredis");
const db = require("../database/mysql");
const util = require("../utils/packages");
require("dotenv").config();

//redis config
const redis = new Redis();

//producer
const queue = new Queue("initialize", redis);

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
  // console.log(data);
  // console.log(data);
  // console.log(data);
  // console.log(data);
  let users = await db.dbs.Users.findAll();

  for (const item of users) {
    // console.log(x)
    if (item.reg_status !== "completed") {
      console.log("Heerere");
      if (item.reg_mail_status != 0) {
        console.log("111111111");
        util.firstMail.processJob(item);
      } else {
        console.log("33333333");
        util.secondMail.processJob(item);
      }
    }
  }

  return;
};

module.exports = {
  processJob,
};
