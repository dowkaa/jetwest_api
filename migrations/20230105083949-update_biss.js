"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("business_compliance", "notes", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("business_compliance", "getStarted", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("business_compliance", "notes"),
    ]);
  },
};
