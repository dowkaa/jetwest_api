var Sequelize = require("sequelize");

var OffLoadedBags = (sequelize: any, type: any) => {
  return sequelize.define("offloaded_bags", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    shipping_items_uuid: Sequelize.STRING,
    schedule_flights_uuid: Sequelize.STRING,
    departure_date: Sequelize.STRING,
    takeoff_airport: Sequelize.STRING,
    shipperName: Sequelize.STRING,
    destination_airport: Sequelize.STRING,
    departure_station: Sequelize.STRING,
    destination_station: Sequelize.STRING,
    status: Sequelize.STRING,
    stoa: Sequelize.STRING,
    stod: Sequelize.STRING,
    taw: Sequelize.INTEGER,
    offload_time: Sequelize.STRING,
    no_of_bags: Sequelize.INTEGER,
    shipping_items_createdAt: Sequelize.STRING,
    schedule_flights_createdAt: Sequelize.STRING,
  });
};

module.exports = OffLoadedBags;
