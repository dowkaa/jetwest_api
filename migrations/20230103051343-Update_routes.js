"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipment_route", "departure", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "dailyExchangeRate", {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 2),
      }),
      queryInterface.addColumn("shipment_route", "value", {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 2),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipment_route", "departure"),
    ]);
  },
};
