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

    await queryInterface.createTable("flights_ongoing", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      scheduleFlight_id: {
        allowNull: false,
        type: Sequelize.STRING,
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
      groundHandler: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      phone_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      atd: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      block_time: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      tat: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      available_capacity: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      },
      totalAmount: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      },
      taw: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      },
      takeoff_airport: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_airport: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      day: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      schedule_type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      country: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shipment_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      departure_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      all_schedules: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      aircraft_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      aircraft_owner: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      logo_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      reference: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      departure_day: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      load_count: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      offload_count: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      no_of_bags: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
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

    await queryInterface.dropTable("flights_ongoing");
  },
};
