"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipment_route", "departure_airport", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "destination_airport", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipment_route", "destination_airport"),
    ]);
  },
};
