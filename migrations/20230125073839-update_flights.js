"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("schedule_flights", "load_count", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("schedule_flights", "offload_count", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("schedule_flights", "scanned_bags"),
    ]);
  },
};
