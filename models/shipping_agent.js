"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
var ShippingAgent = (sequelize, type) => {
    return sequelize.define("shipping_agent", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        user_id: Sequelize.STRING,
        Commodity_type: Sequelize.STRING,
        shipping_info: Sequelize.STRING,
        what_will_you_be_shipping: Sequelize.STRING,
        physical_location: Sequelize.STRING,
        direct_agent: Sequelize.BOOLEAN,
        reason_for_account: Sequelize.STRING,
        how_you_heared_about_jwx: Sequelize.STRING,
        applying_for_a_billable_account: Sequelize.STRING,
    });
};
module.exports = ShippingAgent;
