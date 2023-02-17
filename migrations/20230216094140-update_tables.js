"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "company_name", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("users", "company_role", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "company_name"),
    ]);
  },
};
