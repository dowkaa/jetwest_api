"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "status", {
        allowNull: false,
        defaultValue: "pending",
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "shipment_num", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "shipment_routeId", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "status"),
    ]);
  },
};
