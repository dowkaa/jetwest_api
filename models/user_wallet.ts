var Sequelize = require("sequelize");

var UserWallets = (sequelize: any, type: any) => {
  return sequelize.define("user_wallet", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.INTEGER,
    bank_account: Sequelize.STRING,
    account_number: Sequelize.INTEGER,
    account_name: Sequelize.STRING,
    account_reference: Sequelize.STRING,
    amount: Sequelize.DECIMAL(12, 2),
    amount_owed: Sequelize.DECIMAL(12, 2),
    amount_deducted: Sequelize.DECIMAL(12, 2),
    company_name: Sequelize.STRING,
  }); //PCIDSS
};

module.exports = UserWallets;
