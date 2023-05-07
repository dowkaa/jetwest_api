"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("destinations", "code", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("destinations", "name_of_airport", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("destinations", "groundHandler", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("destinations", "email", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("destinations", "phone_number", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("destinations", "code")]);
  },
};
