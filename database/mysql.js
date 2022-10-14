"use strict";
require("dotenv").config();
const tools = require("../utils/packages");
const db = {};
var sequelize = new tools.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        freezeTableName: true,
    },
});
sequelize
    .authenticate()
    .then(() => {
    console.log("Connection to mysql database has been established successfully");
})
    .catch((error) => {
    console.error("Unable to connect to mysql database: ", error);
});
db.sequelize = sequelize;
db.Users = require("../models/users")(sequelize, tools.Sequelize);
db.CorperateProfile = require("../models/corperate_profile")(sequelize, tools.Sequelize);
db.Oauth = require("../models/oauth")(sequelize, tools.Sequelize);
db.CompanyInfo = require("../models/company_info")(sequelize, tools.Sequelize);
db.Faqs = require("../models/faqs")(sequelize, tools.Sequelize);
db.Testimonials = require("../models/testimonials")(sequelize, tools.Sequelize);
db.Quotes = require("../models/quotes")(sequelize, tools.Sequelize);
db.Promotions = require("../models/promotions")(sequelize, tools.Sequelize);
db.Directors = require("../models/directors")(sequelize, tools.Sequelize);
db.Cargo = require("../models/cargo")(sequelize, tools.Sequelize);
db.Mailing = require("../models/mailing")(sequelize, tools.Sequelize);
db.ShippingAgent = require("../models/shipping_agent")(sequelize, tools.Sequelize);
db.ShippingItems = require("../models/shipping_data")(sequelize, tools.Sequelize);
module.exports = db;
