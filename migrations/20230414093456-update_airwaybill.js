"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("air_waybill", "doc_id", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("air_waybill", "shipper_id", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("shipping_items", "sender_organisation", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("air_waybill", "doc_id")]);
  },
};
