var Sequelize = require("sequelize");

var ApiKeys = (sequelize: any, type: any) => {
  return sequelize.define("api_keys", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    user_type: Sequelize.STRING,
    api_key: Sequelize.STRING,
    secret: Sequelize.STRING,
    api_status: Sequelize.STRING,
    api_live_units: Sequelize.INTEGER,
    api_test_units: Sequelize.INTEGER,
  });
};

module.exports = ApiKeys;
