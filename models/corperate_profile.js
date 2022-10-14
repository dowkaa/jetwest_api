"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require('sequelize');
var CorperateProfile = (sequelize, type) => {
    return sequelize.define("corperate_profile", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: Sequelize.STRING,
        user_id: Sequelize.STRING,
        business_type: Sequelize.STRING,
        dba: Sequelize.STRING,
        company_name: Sequelize.STRING,
        country: Sequelize.STRING,
        city: Sequelize.BOOLEAN,
        state_province: Sequelize.STRING,
        postal_code: Sequelize.STRING,
    });
};
module.exports = CorperateProfile;
