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

    await queryInterface.createTable("frieghts", {
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
      shipment_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      origin: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      std: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sta: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      duration: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      weight: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
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

    await queryInterface.dropTable("frieghts");
  },
};
