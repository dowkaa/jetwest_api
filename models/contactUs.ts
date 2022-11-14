var Sequelize = require("sequelize");

var ContactUs = (sequelize: any, type: any) => {
  return sequelize.define("contactUs", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    email: Sequelize.STRING,
    firstname: Sequelize.STRING,
    lastname: Sequelize.STRING,
    message: Sequelize.TEXT,
  });
};

module.exports = ContactUs;
