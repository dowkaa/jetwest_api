var Sequelize = require("sequelize");

var Destinations = (sequelize: any, type: any) => {
  return sequelize.define("destinations", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    state: Sequelize.STRING,
    country: Sequelize.STRING,
    take_off: Sequelize.STRING,
  });
};

module.exports = Destinations;
