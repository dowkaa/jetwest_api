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
    code: Sequelize.STRING,
    name_of_airport: Sequelize.STRING,
    groundHandler: Sequelize.STRING,
    email: Sequelize.STRING,
    phone_number: Sequelize.STRING,
  });
};

module.exports = Destinations;
