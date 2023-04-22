"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "address", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "country", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "country"),
    ]);
  },
};
