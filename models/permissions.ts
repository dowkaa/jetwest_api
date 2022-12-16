var Sequelize = require("sequelize");

var Permission = (sequelize: any, type: any) => {
  return sequelize.define("permissions", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    type: Sequelize.STRING,
    permissions: Sequelize.TEXT,
  });
};

module.exports = Permission;
