"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require('sequelize');
var Oauth = (sequelize, type) => {
    return sequelize.define("oauth", {
        no: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        id: Sequelize.STRING,
        email: Sequelize.STRING,
        iat: Sequelize.STRING,
        exp: Sequelize.STRING,
    });
};
module.exports = Oauth;
