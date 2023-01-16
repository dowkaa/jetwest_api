var Sequelize = require("sequelize");

var PaystackError = (sequelize: any, type: any) => {
  return sequelize.define("paystack_error", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    data: Sequelize.TEXT,
  });
};

module.exports = PaystackError;
