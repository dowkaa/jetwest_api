"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "chargeable_weight", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DOUBLE,
      }),
      queryInterface.addColumn("transactions", "cargo_id", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("schedule_flights", "chargeable_weight"),
    ]);
  },
};
