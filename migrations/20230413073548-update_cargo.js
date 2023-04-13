"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("cargos", "cargo_types", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("schedule_flights", "aircraft_id", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("cargos", "cargo_types")]);
  },
};
