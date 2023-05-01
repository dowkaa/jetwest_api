"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("webhooks", "body", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("webhooks", "body")]);
  },
};
