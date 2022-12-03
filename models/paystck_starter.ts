var Sequelize = require("sequelize");

var PaystackStarter = (sequelize: any, type: any) => {
  return sequelize.define("paystack_starter", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: Sequelize.INTEGER,
    reference: Sequelize.STRING,
    status: Sequelize.STRING,
  });
};

module.exports = PaystackStarter;
