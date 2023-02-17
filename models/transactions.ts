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
    previous_balance: Sequelize.DECIMAL(12, 2),
    new_balance: Sequelize.DECIMAL(12, 2),
    amount_deducted: Sequelize.DECIMAL(12, 2),
    reference: Sequelize.STRING,
    type: Sequelize.STRING,
    method: Sequelize.STRING,
    status: Sequelize.STRING,
    departure_date: Sequelize.STRING,
    cargo_id: Sequelize.STRING,
    departure: Sequelize.STRING,
    arrival: Sequelize.STRING,
    arrival_date: Sequelize.STRING,
    reciever_organisation: Sequelize.STRING,
    shipment_no: Sequelize.STRING,
    weight: Sequelize.STRING,
    pricePerkeg: Sequelize.STRING,
    no_of_bags: Sequelize.STRING,
    company_name: Sequelize.STRING,
    description: Sequelize.STRING,
  });
};

module.exports = Transactions;
