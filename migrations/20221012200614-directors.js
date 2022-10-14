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
    await queryInterface.createTable("directors", {
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
      first_name: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      },
      lastname_name: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.DOUBLE,
      },
      title: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      dob: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      id_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      id_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      id_type: {
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
      state: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      zip: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      mobile_number: {
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
    await queryInterface.dropTable("directors");
  },
};
