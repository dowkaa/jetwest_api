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
    sur_charge: Sequelize.DECIMAL(12, 2),
    tax: Sequelize.DECIMAL(12, 2),
    agent_rate: Sequelize.DECIMAL(12, 2),
    type: Sequelize.STRING,
    country: Sequelize.STRING,
    destination_name: Sequelize.STRING,
    air_wayBill_rate: Sequelize.DECIMAL(12, 2),
    departure: Sequelize.STRING,
    dailyExchangeRate: Sequelize.DECIMAL(12, 2),
    destination: Sequelize.STRING,
    value: Sequelize.STRING,
    insurance: Sequelize.STRING,
    departure_airport: Sequelize.STRING,
    destination_airport: Sequelize.STRING,
  });
};

module.exports = ShipmentRoute;
