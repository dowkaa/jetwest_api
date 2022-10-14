"use strict";
var Sequelize = require("sequelize");
var Quotes = (sequelize, type) => {
    return sequelize.define("quotes", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        user_id: Sequelize.STRING,
        type: Sequelize.STRING,
        company_name: Sequelize.STRING,
        email: Sequelize.BOOLEAN,
        primary_phone: Sequelize.STRING,
        contact_fullname: Sequelize.STRING,
        phone_number: Sequelize.STRING,
        secondary_phone: Sequelize.STRING,
        length: Sequelize.INTEGER,
        width: Sequelize.INTEGER,
        heigth: Sequelize.INTEGER,
        weight: Sequelize.INTEGER,
        content: Sequelize.STRING,
        value: Sequelize.STRING,
        pick_up: Sequelize.STRING,
        sur_charge: Sequelize.DOUBLE,
        taxes: Sequelize.DOUBLE,
        destination: Sequelize.STRING,
        arrival_date: Sequelize.STRING,
        cargo_id: Sequelize.STRING,
        depature_date: Sequelize.STRING,
        price: Sequelize.DOUBLE,
    });
};
module.exports = Quotes;
