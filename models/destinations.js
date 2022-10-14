"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
var Destinations = (sequelize, type) => {
    return sequelize.define("destinations", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        state: Sequelize.STRING,
        country: Sequelize.STRING,
        take_off: Sequelize.STRING,
    });
};
module.exports = Destinations;
