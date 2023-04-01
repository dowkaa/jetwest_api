var Sequelize = require("sequelize");

var ShipmentTracker = (sequelize: any, type: any) => {
  return sequelize.define("shipment_tracker", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    shipment_id: Sequelize.STRING,
    track_num: Sequelize.STRING,
    is_used: Sequelize.INTEGER,
    expiredAt: Sequelize.STRING,
  });
};

module.exports = ShipmentTracker;
