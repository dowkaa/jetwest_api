"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("transactions", "departure", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "arrival", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("transactions", "arrival"),
    ]);
  },
};
