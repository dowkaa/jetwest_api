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
    await queryInterface.createTable("payment_proof", {
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
      proof_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      admin_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shipment_num: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      amount: {
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
    await queryInterface.dropTable("payment_proof");
  },
};
