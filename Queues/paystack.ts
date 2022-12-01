import Queue from "bull";
const Redis = require("ioredis");
const utils = require("../utils/packages");
const db = require("../database/mysql");
require("dotenv").config();

//redis config
const redis = new Redis({
  host: process.env.DB_HOST,
});

//producer
const queue = new Queue("paystack", redis);

//process jobs
queue.process(async (job: any) => {
  //console.log('---------------- job is processing --------------');
  await addJob(job.data);
});

// git clone https://dlakes@bitbucket.org/dlakes/lottos.git

var opts: any = {
  delay: 100,
  attempts: 1,
};

const processJob = async (data: any) => {
  //Add queue
  queue.add(data, opts);
};

const addJob = async (data: any) => {
  return;
};

module.exports = {
  processJob,
};
