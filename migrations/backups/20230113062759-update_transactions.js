"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("transactions", "departure_date", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "arrival_date", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "shipment_no", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "weight", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "pricePerkeg", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("transactions", "no_of_bags", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("transactions", "no_of_bags"),
    ]);
  },
};
