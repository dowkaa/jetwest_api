var Sequelize = require("sequelize");

var ShipmentInvoives = (sequelize: any, type: any) => {
  return sequelize.define("shipment_invoices", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    shipment_id: Sequelize.STRING,
    invoice_url: Sequelize.STRING,
    company_name: Sequelize.STRING,
  });
};

module.exports = ShipmentInvoives;
