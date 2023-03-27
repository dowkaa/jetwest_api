"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "logo_url", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("schedule_flights", "logo_url", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "reciver_mobile"),
    ]);
  },
};
