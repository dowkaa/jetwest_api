// const express = require('express');
require("dotenv").config();
require("./database/mysql");
const port = process.env.PORT;

const d = require("./database/mysql");

const db = require("./database/mysql");

// const publicRoute = require('./routes/public')
const server = require("./utils/server");
const util = require("./utils/packages");

const addData = async () => {
  for (let i = 0; i < 40; i++) {
    await db.dbs.ShippingItems.create({
      uuid: util.uuid(),
      type: "kncioiec",
      user_id: "ab4489b8-5aa8-45c0-b218-9b14b877b45c",
      agent_id: "9ffd873f-769c-4d11-8c82-0f8bd4291544",
      shipment_num: "cejeiepineifne",
      pickup_location: "Lagos-Internation-Airport",
      destination: "Lagos",
      depature_date: "2022-11-11",
      width: 100,
      height: 100,
      sur_charge: 10,
      taxes: 10,
      status: "pending",
      shipment_routeId: "oeidhiowehfoiehfioeiheiophp",
      scan_code: "niwcenpivnpweov",
      weight: "jnvcowinvpw",
      booking_reference: "shipment_ref",
      volumetric_weight: "10000",
      price: "10000",
      category: "Fragile",
      progress: "completed",
      value: "1000",
      content: "Gold",
      reciever_firstname: "Philomena",
      reciever_lastname: "Kalu",
      reciever_email: "philomenakalu@gmail.com",
      reciver_mobile: "09020269804",
      reciever_primaryMobile: "09020269804",
      reciever_secMobile: "09020269804",
    });

    await db.dbs.ShippingItems.create({
      uuid: util.uuid(),
      type: "kncioiec",
      user_id: "ab4489b8-5aa8-45c0-b218-9b14b877b45c",
      agent_id: "9ffd873f-769c-4d11-8c82-0f8bd4291544",
      shipment_num: "cejeiepineifne",
      pickup_location: "Lagos-Internation-Airport",
      destination: "Lagos",
      depature_date: "2022-11-11",
      width: 100,
      height: 100,
      sur_charge: 10,
      taxes: 10,
      status: "enroute",
      shipment_routeId: "oeidhiowehfoiehfioeiheiophp",
      scan_code: "niwcenpivnpweov",
      weight: "jnvcowinvpw",
      booking_reference: "shipment_ref",
      volumetric_weight: "10000",
      progress: "landed",
      price: "10000",
      category: "Fragile",
      value: "1000",
      content: "Gold",
      reciever_firstname: "Philomena",
      reciever_lastname: "Kalu",
      reciever_email: "philomenakalu@gmail.com",
      reciver_mobile: "09020269804",
      reciever_primaryMobile: "09020269804",
      reciever_secMobile: "09020269804",
    });

    await db.dbs.ShippingItems.create({
      uuid: util.uuid(),
      type: "kncioiec",
      user_id: "ab4489b8-5aa8-45c0-b218-9b14b877b45c",
      agent_id: "9ffd873f-769c-4d11-8c82-0f8bd4291544",
      shipment_num: "cejeiepineifne",
      pickup_location: "Lagos-Internation-Airport",
      destination: "Lagos",
      depature_date: "2022-11-11",
      width: 100,
      progress: "loaded",
      height: 100,
      sur_charge: 10,
      taxes: 10,
      status: "completed",
      shipment_routeId: "oeidhiowehfoiehfioeiheiophp",
      scan_code: "niwcenpivnpweov",
      weight: "jnvcowinvpw",
      booking_reference: "shipment_ref",
      volumetric_weight: "10000",
      price: "10000",
      category: "Fragile",
      value: "1000",
      content: "Gold",
      reciever_firstname: "Philomena",
      reciever_lastname: "Kalu",
      reciever_email: "philomenakalu@gmail.com",
      reciver_mobile: "09020269804",
      reciever_primaryMobile: "09020269804",
      reciever_secMobile: "09020269804",
    });
  }
};

if (process.env.STATE === "prod") {
  addData();
}

const app = server.createServer();
const http = require("http").Server(app);

module.exports = http.listen(port || 2023, () => {
  console.log(`Server started on port ${port}`);
});
