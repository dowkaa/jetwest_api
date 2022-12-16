var Sequelize = require("sequelize");

var Roles = (sequelize: any, type: any) => {
  return sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    name: Sequelize.STRING,
    status: Sequelize.STRING,
    description: Sequelize.STRING,
  });
};

module.exports = Roles;
