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
  });
};

module.exports = ShipmentRoute;
