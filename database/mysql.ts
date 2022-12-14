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
dbs.AircraftAuditLog = require("../models/aircraftAudit")(
  sequelize,
  Sequelizes
);
dbs.ShipmentRoutes = require("../models/shipment_route")(sequelize, Sequelizes);
dbs.Quotes = require("../models/quotes")(sequelize, Sequelizes);
dbs.Promotions = require("../models/promotions")(sequelize, Sequelizes);
dbs.Frieghts = require("../models/frieghts")(sequelize, Sequelizes);
dbs.PaystackStarter = require("../models/paystck_starter")(
  sequelize,
  Sequelizes
);
dbs.AuditLogs = require("../models/audit_logs")(sequelize, Sequelizes);
dbs.ScheduleLogs = require("../models/scheduled_audits")(sequelize, Sequelizes);
dbs.Roles = require("../models/roles")(sequelize, Sequelizes);
dbs.Permissions = require("../models/permissions")(sequelize, Sequelizes);
dbs.Webhook = require("../models/webhook")(sequelize, Sequelizes);
dbs.Directors = require("../models/directors")(sequelize, Sequelizes);
dbs.Transactions = require("../models/transactions")(sequelize, Sequelizes);
dbs.Cargo = require("../models/cargo")(sequelize, Sequelizes);
dbs.ContactUs = require("../models/contactUs")(sequelize, Sequelizes);
dbs.Mailing = require("../models/mailing")(sequelize, Sequelizes);
dbs.ShippingAgent = require("../models/shipping_agent")(sequelize, Sequelizes);
dbs.ScheduleFlights = require("../models/shedule_flights")(
  sequelize,
  Sequelizes
);
dbs.Destinations = require("../models/destinations")(sequelize, Sequelizes);
dbs.BusinessCompliance = require("../models/business_compliance")(
  sequelize,
  Sequelizes
);
dbs.ShippingItems = require("../models/shipping_data")(sequelize, Sequelizes);

dbs.BusinessCompliance.belongsTo(dbs.Users, {
  foreignKey: "user_id",
  uniqueKey: "uuid",
  // as: "business_compliance",
});

dbs.Users.hasOne(dbs.BusinessCompliance, {
  foreignKey: "user_id",
  // as: "business_compliance",
});

dbs.Users.hasOne(dbs.Directors, {
  foreignKey: "user_id",
  // as: "business_compliance",
});

exports.dbs = dbs;
