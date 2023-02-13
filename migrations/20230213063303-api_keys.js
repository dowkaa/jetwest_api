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
    await queryInterface.createTable("api_keys", {
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
      user_type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      api_key: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      api_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      api_live_units: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      api_test_units: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      secret: {
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
    await queryInterface.dropTable("api_keys");
  },
};
