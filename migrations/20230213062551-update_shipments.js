"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "booking_type", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("audit_logs", "data", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "organisation"),
    ]);
  },
};
