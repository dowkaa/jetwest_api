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
    amount_in_dollars: Sequelize.DECIMAL(12, 2),
    amount_in_local_currency: Sequelize.DECIMAL(12, 2),
    previous_balance: Sequelize.DECIMAL(12, 2),
    rate: Sequelize.DECIMAL(12, 2),
    new_balance: Sequelize.DECIMAL(12, 2),
    amount_deducted: Sequelize.DECIMAL(12, 2),
    reference: Sequelize.STRING,
    type: Sequelize.STRING,
    method: Sequelize.STRING,
    status: Sequelize.STRING,
    departure_date: Sequelize.STRING,
    booked_by: Sequelize.STRING,
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
    airwaybill_cost: Sequelize.DECIMAL(12, 2),
    total_cost: Sequelize.DECIMAL(12, 2),
  });
};

module.exports = Transactions;
