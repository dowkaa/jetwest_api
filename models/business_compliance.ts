import { type } from "os";

var Sequelize = require("sequelize");

var BusinessCompliance = (sequelize: any, type: any) => {
  return sequelize.define("business_compliance", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    natureOf_biz: Sequelize.STRING,
    business_reg_num: Sequelize.STRING,
    biz_tax_id: Sequelize.STRING,
    country_of_incorporation: Sequelize.STRING,
    incorporation_date: Sequelize.STRING,
    country_of_operation: Sequelize.STRING,
    mobile: Sequelize.STRING,
    email: Sequelize.STRING,
    incoporation_doc_url: Sequelize.STRING,
    incoporation_doc_url_status: Sequelize.STRING,
    proofOf_biz_address_url: Sequelize.STRING,
    proofOf_biz_address_url_status: Sequelize.STRING,
    guarantor_form_url: Sequelize.STRING,
    guarantor_form_url_status: Sequelize.STRING,
    artOf_association_url: Sequelize.STRING,
    artOf_association_status: Sequelize.STRING,
    shareHolder_register_url: Sequelize.STRING,
    shareHolder_register_url_status: Sequelize.STRING,
    memorandumOf_guidance_url: Sequelize.STRING,
    memorandumOf_guidance_url_status: Sequelize.STRING,
    status: Sequelize.INTEGER,
  });
};

module.exports = BusinessCompliance;
