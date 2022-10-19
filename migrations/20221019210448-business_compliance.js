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

    await queryInterface.createTable("business_compliance", {
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
      natureOf_biz: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      business_reg_num: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      biz_tax_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      country_of_incorporation: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      incorporation_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      country_of_operation: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      mobile: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      incoporation_doc_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      incoporation_doc_url_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      proofOf_biz_address_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      proofOf_biz_address_url_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      guarantor_form_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      guarantor_form_url_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      artOf_association_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      artOf_association_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shareHolder_register_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      shareHolder_register_url_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      memorandumOf_guidance_url: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      memorandumOf_guidance_url_status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
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

    await queryInterface.dropTable("business_compliance");
  },
};
