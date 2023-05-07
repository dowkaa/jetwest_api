"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipment_route", "type", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "agent_rate", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      }),
      queryInterface.addColumn("shipping_items", "air_wayBill_rate", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("shipment_route", "type")]);
  },
};
