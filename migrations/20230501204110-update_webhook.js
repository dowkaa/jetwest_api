"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("webhooks", "body")]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("webhooks", "body")]);
  },
};
