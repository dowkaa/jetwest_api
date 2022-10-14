"use strict";
var Sequelize = require("sequelize");
var Promotions = (sequelize, type) => {
    return sequelize.define("promotions", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        type: Sequelize.STRING,
        percentage: Sequelize.STRING,
        is_active: Sequelize.INTEGER,
        startDate: Sequelize.STRING,
        endDate: Sequelize.STRING,
        code: Sequelize.STRING,
    });
};
module.exports = Promotions;
