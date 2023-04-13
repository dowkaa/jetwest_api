var Sequelize = require("sequelize");

var CargoTypes = (sequelize: any, type: any) => {
  return sequelize.define("cargo_types", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    name: Sequelize.STRING,
    types: Sequelize.TEXT,
  });
};

module.exports = CargoTypes;
