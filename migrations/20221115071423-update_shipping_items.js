"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "is_scanned", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("shipping_items", "scan_code", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "is_scanned"),
    ]);
  },
};
