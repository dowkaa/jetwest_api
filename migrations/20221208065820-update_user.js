"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "reg_mail_status", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      }),

      queryInterface.addColumn("users", "login_count", {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "reg_mail_status"),
    ]);
  },
};
