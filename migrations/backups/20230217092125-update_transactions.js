"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("transactions", "previous_balance", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "new_balance", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("transactions", "amount_deducted", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("transactions", "company_name", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("transactions", "amount_deducted"),
    ]);
  },
};
