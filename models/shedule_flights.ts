var Sequelize = require("sequelize");

var ScheduleFlights = (sequelize: any, type: any) => {
  return sequelize.define("schedule_flights", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    departure_station: Sequelize.STRING,
    departure_date: Sequelize.STRING,
    destination_station: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    arrival_date: Sequelize.STRING,
    scheduled_payload: Sequelize.STRING,
    stod: Sequelize.STRING,
    stoa: Sequelize.STRING,
    status: Sequelize.STRING,
    duration: Sequelize.STRING,
    groundHandler: Sequelize.STRING,
    email: Sequelize.STRING,
    phone_number: Sequelize.STRING,
  });
};

module.exports = ScheduleFlights;
