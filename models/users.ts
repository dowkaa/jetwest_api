var Sequelize = require("sequelize");

var User = (sequelize: any, type: any) => {
  return sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    customer_id: Sequelize.STRING,
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    mobile_number: Sequelize.STRING,
    activated: Sequelize.INTEGER,
    otp: Sequelize.STRING,
    locked: Sequelize.INTEGER,
    country: Sequelize.STRING,
    company_name: Sequelize.STRING,
    company_address: Sequelize.STRING,
    companyFounded: Sequelize.STRING,
    nature_of_business: Sequelize.STRING,
    business_reg_number: Sequelize.STRING,
    taxId_vat_number: Sequelize.STRING,
    ratePerKg: Sequelize.DOUBLE,
    business_country: Sequelize.DOUBLE,
    type: Sequelize.STRING,
  });
};

module.exports = User;
