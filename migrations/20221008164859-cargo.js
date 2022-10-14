"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("cargos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      owner_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      capacity: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      },
      available_capacity: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      },
      take_off: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      geo_coverage: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      monthly_flight_time: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      is_available: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      airworthiness_type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      airworthiness_make: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      airworthiness_model: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      airworthiness_cert_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      aircraft_registration: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      airworthiness_cert_exp_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      noise_cert_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      noise_cert_exp_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      insurance_cert_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      insurance_cert_exp_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      registration_cert: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      registration_cert_exp_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      mmel: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ops_manual: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      createdAt: {
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updatedAt: {
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("cargos");
  },
};
