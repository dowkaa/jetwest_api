var Sequelize = require("sequelize");

var Transactions = (sequelize: any, type: any) => {
  return sequelize.define("transactions", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    amount: Sequelize.STRING,
    reference: Sequelize.STRING,
    type: Sequelize.STRING,
    method: Sequelize.STRING,
    status: Sequelize.STRING,
    description: Sequelize.STRING,
  });
};

module.exports = Transactions;
