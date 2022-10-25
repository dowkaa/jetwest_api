import { type } from "os";

var Sequelize = require("sequelize");

var shippingItems = (sequelize: any, type: any) => {
  return sequelize.define("shipping_items", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    type: Sequelize.STRING,
    pickup_location: Sequelize.STRING,
    depature_date: Sequelize.STRING,
    destination: Sequelize.STRING,
    arrival_date: Sequelize.STRING,
    width: Sequelize.STRING,
    cargo_id: Sequelize.STRING,
    agent_id: Sequelize.STRING,
    price: Sequelize.DOUBLE,
    height: Sequelize.STRING,
    weight: Sequelize.STRING,
    volumetric_weight: Sequelize.INTEGER,
    booking_reference: Sequelize.STRING,
    sur_charge: Sequelize.DOUBLE,
    taxes: Sequelize.DOUBLE,
    category: Sequelize.STRING,
    promo_code: Sequelize.STRING,
    value: Sequelize.STRING,
    content: Sequelize.STRING,
    reciever_firstname: Sequelize.STRING,
    reciever_lastname: Sequelize.STRING,
    reciever_email: Sequelize.STRING,
    reciver_mobile: Sequelize.STRING,
    reciever_primaryMobile: Sequelize.STRING,
    reciever_secMobile: Sequelize.STRING,
  });
};

module.exports = shippingItems;
