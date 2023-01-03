"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipment_route", "interest", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipment_route", "interest"),
    ]);
  },
};
