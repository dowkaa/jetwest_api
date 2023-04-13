var Sequelize = require("sequelize");

var AirWayBill = (sequelize: any, type: any) => {
  return sequelize.define("air_waybill", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    carrier_id: Sequelize.STRING,
    doc_url: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    shipment_num: Sequelize.STRING,
    agent_id: Sequelize.STRING,
  });
};

module.exports = AirWayBill;
