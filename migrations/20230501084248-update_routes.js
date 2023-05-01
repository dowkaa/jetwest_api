"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipment_route", "air_wayBill_rate", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipment_route", "air_wayBill_rate"),
    ]);
  },
};
