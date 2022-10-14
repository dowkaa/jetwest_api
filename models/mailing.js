"use strict";
var Sequelize = require("sequelize");
var Mailing_list = (sequelize, type) => {
    return sequelize.define("mailing_list", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        email: Sequelize.STRING,
    });
};
module.exports = Mailing_list;
