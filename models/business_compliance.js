"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
var BusinessCompliance = (sequelize, type) => {
    return sequelize.define("business_compliance", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: Sequelize.STRING,
        user_id: Sequelize.STRING,
        incoporation_doc_url: Sequelize.STRING,
        incoporation_doc_url_status: Sequelize.INTEGER,
        director_owner_id_url: Sequelize.STRING,
        director_owner_id_url_status: Sequelize.INTEGER,
        proofOf_biz_address_url: Sequelize.STRING,
        proofOf_biz_address_url_status: Sequelize.INTEGER,
        guarantor_form_url: Sequelize.STRING,
        guarantor_form_url_status: Sequelize.STRING,
        shareHolder_register_url: Sequelize.STRING,
        shareHolder_register_url_status: Sequelize.STRING,
        memorandumOf_guidance_url: Sequelize.STRING,
        memorandumOf_guidance_url_status: Sequelize.STRING,
        director_valid_id_url: Sequelize.STRING,
        director_valid_id_url_status: Sequelize.INTEGER,
        director_photo_url: Sequelize.STRING,
        director_photo_url_status: Sequelize.INTEGER,
    });
};
module.exports = BusinessCompliance;
