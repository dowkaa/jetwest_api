"use strict";
var Sequelize = require("sequelize");
var Directors = (sequelize, type) => {
    return sequelize.define("directors", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        user_id: Sequelize.STRING,
        first_name: Sequelize.STRING,
        last_name: Sequelize.STRING,
        title: Sequelize.STRING,
        dob: Sequelize.STRING,
        email: Sequelize.STRING,
        id_number: Sequelize.STRING,
        id_type: Sequelize.STRING,
        id_url: Sequelize.STRING,
        address: Sequelize.STRING,
        country: Sequelize.STRING,
        state: Sequelize.STRING,
        zip: Sequelize.STRING,
        mobile_number: Sequelize.STRING,
    });
};
module.exports = Directors;
