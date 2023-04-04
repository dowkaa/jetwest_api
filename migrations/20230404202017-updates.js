"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipping_items", "insurance", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DECIMAL,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "insurance"),
    ]);
  },
};
