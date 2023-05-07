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

    await queryInterface.createTable("shipping_info", {
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
      Commodity_type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shipping_info: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      what_will_you_be_shipping: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      physical_location: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      direct_agent: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      },
      reason_for_account: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      how_you_heared_about_jwx: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      applying_for_a_billable_account: {
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

    await queryInterface.dropTable("shipping_info");
  },
};
