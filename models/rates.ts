var Sequelize = require("sequelize");

var Rates = (sequelize: any, type: any) => {
  return sequelize.define("rates", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    value: Sequelize.DOUBLE(10, 2),
  });
};

module.exports = Rates;
