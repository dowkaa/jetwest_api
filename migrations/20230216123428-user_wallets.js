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
    await queryInterface.createTable("user_wallet", {
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
        type: Sequelize.INTEGER,
      },
      bank_account: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      account_number: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      account_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      account_reference: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      company_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      amount: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      },
      amount_owed: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(12, 2),
      },
      amount_deducted: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 2),
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
    await queryInterface.dropTable("user_wallet");
  },
};
