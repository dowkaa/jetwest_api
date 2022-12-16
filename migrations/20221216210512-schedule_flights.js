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

    await queryInterface.createTable("schedule_flights", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      departure_station: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      departure_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_station: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      flight_reg: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      arrival_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      scheduled_payload: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      stod: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      stoa: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      duration: {
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

    await queryInterface.dropTable("schedule_flights");
  },
};
