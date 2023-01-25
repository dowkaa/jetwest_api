"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("schedule_flights", "no_of_bags", {
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
