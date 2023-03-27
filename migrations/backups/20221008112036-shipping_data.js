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
    await queryInterface.createTable("shipping_items", {
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
      cargo_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      agent_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      pickup_location: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      depature_date: {
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
      price: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      },
      width: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      height: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      weight: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      volumetric_weight: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      booking_reference: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      category: {
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
      promo_code: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      value: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      content: {
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
    await queryInterface.dropTable("shipping_items");
  },
};
