var Sequelize = require("sequelize");

var AirWayBillRate = (sequelize: any, type: any) => {
  return sequelize.define("air_waybill_for_shipment", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    shipment_num: Sequelize.STRING,
    amount: Sequelize.DOUBLE,
  });
};

module.exports = AirWayBillRate;
