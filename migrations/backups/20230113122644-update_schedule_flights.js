"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("schedule_flights", "takeoff_airport", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "destination_airport", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("schedule_flights", "destination_airport"),
    ]);
  },
};
