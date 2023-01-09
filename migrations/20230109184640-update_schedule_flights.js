"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("schedule_flights", "groundHandler", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "email", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "phone_number", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("schedule_flights", "email"),
    ]);
  },
};
