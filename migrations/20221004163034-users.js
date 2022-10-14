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

    await queryInterface.createTable("users", {
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
      customer_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      mobile_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      activated: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      otp: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      locked: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      country: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      company_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      company_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      companyFounded: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      nature_of_business: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      business_reg_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      taxId_vat_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ratePerKg: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.DOUBLE,
      },
      business_country: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      type: {
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

    await queryInterface.dropTable("users");
  },
};
