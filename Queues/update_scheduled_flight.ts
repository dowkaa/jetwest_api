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
  attempts: 3,
};

const processJob = async (data: any) => {
  //Add queue
  queue.add(data, options);
};

const addJob = async (data: any) => {
  let item = await db.dbs.ScheduleFlights.findOne({
    where: { uuid: data.uuid },
    order: [["id", "DESC"]],
  });

  let arr = JSON.parse(item.departure_date);
  let arr2 = [];
  // let arr2 = [];

  // if (arr.length === 1) {
  //   if (Date.parse(arr[0]) - Date.parse(date) <= 7200000) {
  //     item.status = "In progress";

  // console.log({
  //   talk: Date.parse(arr[0] + " " + item.stod) - Date.now(),
  //   arr: arr[0],
  //   stod: item.stod,
  // });
  //     await item.save();
  //   }
  //   return;
  // } else {
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (Date.parse(arr[i] + " " + item.stod) - Date.now() <= 7200000) {
        let checker = await db.dbs.FlightsOngoing.findOne({
          where: {
            stod: item.stod,
            departure_station: item.departure_station,
            destination_station: item.destination_station,
            flight_reg: item.flight_reg,
            stoa: item.stoa,
            departure_date: arr[i],
          },
        });

        if (!checker) {
          await db.dbs.FlightsOngoing.create({
            uuid: utils.uuid(),
            scheduleFlight_id: item.id,
            user_id: item.user_id,
            departure_station: item.departure_station,
            flight_reg: item.flight_reg,
            aircraft_id: item.aircraft_id,
            takeoff_airport: item.takeoff_airport,
            destination_airport: data.name_of_airport,
            stod: item.stod,
            stoa: item.stoa,
            logo_url: item.logo_url,
            no_of_bags: item.no_of_bags,
            status: "In progress",
            day: item.day,
            duration: item.duration,
            aircraft_owner: item.aircraft_owner,
            scheduled_payload: item.scheduled_payload,
            available_capacity: item.available_capacity,
            arrival_date: item.arrival_date,
            departure_date: arr[i],
            all_schedules: item.all_schedules,
            departure_day: item.departure_day,
            destination_station: item.destination_station,
            groundHandler: data.groundHandler,
            schedule_type: item.schedule_type,
            email: item.email,
            phone_number: item.phone_number,
          });
        }
      } else {
        arr2.push(arr[i]);
      }
    }
  }
  item.departure_date = JSON.stringify(arr2);
  await item.save();
  return;
  // }
};

module.exports = {
  processJob,
};
