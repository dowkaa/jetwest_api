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
    await queryInterface.createTable("quotes", {
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
      user_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      company_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      primary_phone: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      contact_fullname: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sur_charge: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      taxes: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      phone_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      secondary_phone: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cargo_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      price: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      },
      length: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      heigth: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      width: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      weight: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      content: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      value: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      pick_up: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      value: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      arrival_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      depature_date: {
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
    await queryInterface.dropTable("quotes");
  },
};
