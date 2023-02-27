var Sequelize = require("sequelize");

var PaymentProofs = (sequelize: any, type: any) => {
  return sequelize.define("payment_proof", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    proof_url: Sequelize.STRING,
    admin_id: Sequelize.STRING,
    shipment_ref: Sequelize.STRING,
    amount: Sequelize.DECIMAL(10, 2),
  });
};

module.exports = PaymentProofs;
