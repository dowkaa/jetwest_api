"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("shipment_route", "sur_charge", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DOUBLE,
      }),

      queryInterface.addColumn("shipment_route", "tax", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DOUBLE,
      }),
      queryInterface.addColumn("shipment_route", "country", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "destination_name", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "code", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "groundHandler", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "email", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipment_route", "phone_number", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "reg_mail_status"),
    ]);
  },
};
