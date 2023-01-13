"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("schedule_flights", "available_capacity", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      }),
      queryInterface.addColumn("schedule_flights", "totalAmount", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      }),
      queryInterface.addColumn("schedule_flights", "taw", {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("schedule_flights", "atd"),
    ]);
  },
};
