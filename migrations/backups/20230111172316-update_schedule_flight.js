"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("schedule_flights", "atd", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "block_time", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "tat", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("schedule_flights", "atd"),
    ]);
  },
};
