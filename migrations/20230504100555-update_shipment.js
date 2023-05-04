"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "route_id", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "airwaybill_cost", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      }),
      queryInterface.addColumn("transactions", "total_cost", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "route_id"),
    ]);
  },
};
