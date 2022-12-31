"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("cargos", "airworthiness_cert_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "noise_cert_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "insurance_cert_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "registration_cert_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "maintenance_program_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "mmel_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "ops_manual_status", {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn("cargos", "note", {
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
