"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "last_login_time", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "uuid", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "last_login_time"),
    ]);
  },
};
