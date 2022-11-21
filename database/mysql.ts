require("dotenv").config();
const tools = require("../utils/packages");
const Sequelizes = require("sequelize");

const dbs: any = {};

var sequelize = new Sequelizes(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
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
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to mysql database has been established successfully"
    );
  })
  .catch((error: any) => {
    console.error("Unable to connect to mysql database: ", error);
  });

dbs.sequelize = sequelize;

dbs.Users = require("../models/users")(sequelize, Sequelizes);
dbs.CorperateProfile = require("../models/corperate_profile")(
  sequelize,
  Sequelizes
);
dbs.Oauth = require("../models/oauth")(sequelize, Sequelizes);
dbs.CompanyInfo = require("../models/company_info")(sequelize, Sequelizes);
dbs.Faqs = require("../models/faqs")(sequelize, Sequelizes);
dbs.Testimonials = require("../models/testimonials")(sequelize, Sequelizes);
dbs.ShipmentRoutes = require("../models/shipment_route")(sequelize, Sequelizes);
dbs.Quotes = require("../models/quotes")(sequelize, Sequelizes);
dbs.Promotions = require("../models/promotions")(sequelize, Sequelizes);
dbs.Frieghts = require("../models/frieghts")(sequelize, Sequelizes);
dbs.Directors = require("../models/directors")(sequelize, Sequelizes);
dbs.Cargo = require("../models/cargo")(sequelize, Sequelizes);
dbs.ContactUs = require("../models/contactUs")(sequelize, Sequelizes);
dbs.Mailing = require("../models/mailing")(sequelize, Sequelizes);
dbs.ShippingAgent = require("../models/shipping_agent")(sequelize, Sequelizes);
dbs.BusinessCompliance = require("../models/business_compliance")(
  sequelize,
  Sequelizes
);
dbs.ShippingItems = require("../models/shipping_data")(sequelize, Sequelizes);

exports.dbs = dbs;
