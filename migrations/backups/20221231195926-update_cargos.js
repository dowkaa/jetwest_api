"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("cargos", "airworthiness_cert_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "noise_cert_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "insurance_cert_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "registration_cert_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "maintenance_program_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "mmel_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "ops_manual_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "note", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("cargos", "aircraft_type_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "payload_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "ops_spec_checked", {
        allowNull: true,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "flight_hrs_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "aircraft_registration_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "airworthiness_cert_exp_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),

      queryInterface.addColumn("cargos", "noise_cert_exp_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "insurance_cert_exp_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "registration_cert_exp_checked", {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "noteOne", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),

      queryInterface.addColumn("cargos", "driveLink", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("cargos", "noteTwo", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("cargos", "airworthiness_cert_status"),
    ]);
  },
};
