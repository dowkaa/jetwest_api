var Sequelize = require("sequelize");

var ShipmentRoute = (sequelize: any, type: any) => {
  return sequelize.define("shipment_route", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    route: Sequelize.STRING,
    ratePerKg: Sequelize.STRING,
    sur_charge: Sequelize.DOUBLE,
    tax: Sequelize.DOUBLE,
    agent_rate: Sequelize.DOUBLE,
    type: Sequelize.STRING,
    country: Sequelize.STRING,
    destination_name: Sequelize.STRING,
    air_wayBill_rate: Sequelize.DOUBLE,
    departure: Sequelize.STRING,
    dailyExchangeRate: Sequelize.STRING,
    destination: Sequelize.STRING,
    value: Sequelize.STRING,
    insurance: Sequelize.STRING,
    departure_airport: Sequelize.STRING,
    destination_airport: Sequelize.STRING,
  });
};

module.exports = ShipmentRoute;
