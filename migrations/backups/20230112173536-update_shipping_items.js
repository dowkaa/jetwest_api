"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "shipperName", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "shipperNum", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "no_of_bags", {
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
