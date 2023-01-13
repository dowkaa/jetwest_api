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
    await queryInterface.createTable("loaded_bags", {
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
      flight_reg: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shipping_items_uuid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      schedule_flights_uuid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      departure_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      takeoff_airport: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shipperName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_airport: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      departure_station: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_station: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      stoa: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      stod: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      taw: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      no_of_bags: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      shipping_items_createdAt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      schedule_flights_createdAt: {
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
    await queryInterface.dropTable("loaded_bags");
  },
};
