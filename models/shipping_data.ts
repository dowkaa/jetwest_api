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
    destination_route: Sequelize.STRING,
    destination: Sequelize.STRING,
    organisation: Sequelize.STRING,
    arrival_date: Sequelize.STRING,
    width: Sequelize.STRING,
    length: Sequelize.INTEGER,
    cargo_id: Sequelize.STRING,
    agent_id: Sequelize.STRING,
    price: Sequelize.DOUBLE,
    ispaid: Sequelize.INTEGER,
    frieghtTime: Sequelize.INTEGER,
    ba_code_url: Sequelize.STRING,
    height: Sequelize.STRING,
    shipment_routeId: Sequelize.STRING,
    is_scanned: Sequelize.INTEGER,
    scan_code: Sequelize.STRING,
    weight: Sequelize.INTEGER,
    volumetric_weight: Sequelize.INTEGER,
    booking_reference: Sequelize.STRING,
    sur_charge: Sequelize.DOUBLE,
    taxes: Sequelize.DOUBLE,
    category: Sequelize.STRING,
    flight_id: Sequelize.STRING,
    shipperName: Sequelize.STRING,
    shipperNum: Sequelize.STRING,
    no_of_bags: Sequelize.INTEGER,
    ratePerKg: Sequelize.INTEGER,
    shipment_num: Sequelize.STRING,
    status: Sequelize.STRING,
    promo_code: Sequelize.STRING,
    value: Sequelize.STRING,
    chargeable_weight: Sequelize.DOUBLE,
    content: Sequelize.STRING,
    reciever_firstname: Sequelize.STRING,
    reciever_lastname: Sequelize.STRING,
    reference: Sequelize.STRING,
    reciever_email: Sequelize.STRING,
    reciever_organisation: Sequelize.STRING,
    progress: Sequelize.STRING,
    payment_status: Sequelize.STRING,
    logo_url: Sequelize.STRING,

    reciever_primaryMobile: Sequelize.STRING,
    reciever_secMobile: Sequelize.STRING,
  });
};

module.exports = shippingItems;
