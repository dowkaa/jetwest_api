"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "reciver_mobile"),
      queryInterface.addColumn("shipping_items", "reciever_organisation", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "length", {
        allowNull: true,
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("shipping_items", "reciver_mobile"),
    ]);
  },
};
