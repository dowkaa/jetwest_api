var Sequelize = require("sequelize");

var FlightsOngoing = (sequelize: any, type: any) => {
  return sequelize.define("flights_ongoing", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    scheduleFlight_id: Sequelize.STRING,
    user_id: Sequelize.STRING,
    departure_station: Sequelize.STRING,
    departure_date: Sequelize.STRING,
    all_schedules: Sequelize.STRING,
    destination_station: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    arrival_date: Sequelize.STRING,
    scheduled_payload: Sequelize.STRING,
    stod: Sequelize.STRING,
    stoa: Sequelize.STRING,
    aircraft_id: Sequelize.STRING,
    status: Sequelize.STRING,
    destination_airport: Sequelize.STRING,
    progress: Sequelize.STRING,
    day: Sequelize.STRING,
    takeoff_airport: Sequelize.STRING,
    departure_day: Sequelize.STRING,
    atd: Sequelize.STRING,
    block_time: Sequelize.STRING,
    aircraft_owner: Sequelize.STRING,
    available_capacity: Sequelize.INTEGER,
    taw: Sequelize.INTEGER,
    totalAmount: Sequelize.DECIMAL(12, 2),
    tat: Sequelize.STRING,
    // schedule_type: Sequelize.STRING,
    duration: Sequelize.STRING,
    groundHandler: Sequelize.STRING,
    email: Sequelize.STRING,
    offload_count: Sequelize.INTEGER,
    load_count: Sequelize.INTEGER,
    no_of_bags: Sequelize.INTEGER,
    logo_url: Sequelize.STRING,
    phone_number: Sequelize.STRING,
  });
};

module.exports = FlightsOngoing;
