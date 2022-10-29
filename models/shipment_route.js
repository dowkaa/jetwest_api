"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
var ShipmentRoute = (sequelize, type) => {
    return sequelize.define("shipment_route", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        route: Sequelize.STRING,
        ratePerKg: Sequelize.STRING,
    });
};
module.exports = ShipmentRoute;
