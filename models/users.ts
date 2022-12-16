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
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    customer_id: Sequelize.STRING,
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    country: Sequelize.STRING,
    password: Sequelize.STRING,
    mobile_number: Sequelize.STRING,
    reg_mail_status: Sequelize.INTEGER,
    is_Admin: Sequelize.INTEGER,
    admin_type: Sequelize.STRING,
    roles: Sequelize.TEXT,
    status: Sequelize.STRING,
    company_name: Sequelize.STRING,
    login_count: Sequelize.INTEGER,
    airport: Sequelize.STRING,
    company_address: Sequelize.STRING,
    reg_status: Sequelize.STRING,
    companyFounded: Sequelize.STRING,
    type: Sequelize.STRING,
    ratePerKg: Sequelize.DOUBLE,
    otp: Sequelize.STRING,
    locked: Sequelize.INTEGER,
    activated: Sequelize.INTEGER,
  });
};

module.exports = User;
