"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "is_Admin", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("users", "admin_type", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("users", "roles", {
        allowNull: true,
        type: Sequelize.TEXT,
      }),

      queryInterface.addColumn("users", "status", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("users", "roles")]);
  },
};
