var Sequelize = require("sequelize");

var CompanyInfo = (sequelize: any, type: any) => {
  return sequelize.define("company_info", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    company_name: Sequelize.STRING,
    mobile_number: Sequelize.STRING,
    primary_number: Sequelize.STRING,
    country: Sequelize.STRING,
    address: Sequelize.STRING,
    contact_fullname: Sequelize.STRING,
    postal_code: Sequelize.STRING,
    secondary_number: Sequelize.STRING,
    state: Sequelize.STRING,
  });
};

module.exports = CompanyInfo;
