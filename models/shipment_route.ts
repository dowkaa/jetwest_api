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
    country: Sequelize.STRING,
    destination_name: Sequelize.STRING,
    code: Sequelize.STRING,
    groundHandler: Sequelize.STRING,
    email: Sequelize.STRING,
    phone_number: Sequelize.STRING,
  });
};

module.exports = ShipmentRoute;
