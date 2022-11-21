var Sequelize = require("sequelize");

var Frieghts = (sequelize: any, type: any) => {
  return sequelize.define("frieghts", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    shipment_id: Sequelize.STRING,
    cargo_id: Sequelize.STRING,
    date: Sequelize.STRING,
    origin: Sequelize.STRING,
    std: Sequelize.STRING,
    destination: Sequelize.STRING,
    sta: Sequelize.STRING,
    duration: Sequelize.STRING,
    weight: Sequelize.STRING,
    status: Sequelize.STRING,
  });
};

module.exports = Frieghts;
