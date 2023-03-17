const expresss = require("express");
const router = expresss.Router();
require("dotenv").config();

const Register = require("../controllers/RegisterCtrl");
const LoginCtrl = require("../controllers/LoginCtrl");
const HomeCtrl = require("../controllers/HomeCtrl");
const CarrierCtrl = require("../controllers/CariersCtrl");

// Authentication
router.post("/register_step_one", Register.step1);
router.post("/register_activate", Register.step2);
router.post("/update_account", Register.step3);
router.post("/add_business", Register.addBusiness);
router.post("/update_business_compliance", Register.businessDocs);
router.post("/add_directors", Register.step4);
router.post("/login", LoginCtrl.Login);
router.post("/login-carrier", CarrierCtrl.Login);
router.get("/resend-otp", HomeCtrl.requestOtp);

// registration staus
router.get("/update_reg_status", HomeCtrl.updateRegStatus);
router.get("/get-reg-status", HomeCtrl.getRegStatus);

router.get("/get-rates", HomeCtrl.getRate);

//All agents
router.get("/all-agents", HomeCtrl.allAgents);
router.get("/single-agent", HomeCtrl.singleAgent);

// cargos
router.get("/all-cargos", HomeCtrl.allCargos);
router.get("/single-cargo", HomeCtrl.singleCargo);

//Home routes
router.get("/get_faqs", HomeCtrl.getFags);
router.get("/all_testimonials", HomeCtrl.getTestimonials);
router.post("/add_mail", HomeCtrl.postMailing);
router.get("/shipping_item", HomeCtrl.getShippingData);
router.get("/check_promo", HomeCtrl.checkPromo);
router.get("/api-docs", HomeCtrl.getApiDocs);

// shipment routes
router.get("/routes", HomeCtrl.shipmentRoutes);

// get in touch
router.post("/get-in-touch", HomeCtrl.getInTouch);

router.get("/all-pending-flights", HomeCtrl.allPendingShipments);

router.get("/check-flight-availability", HomeCtrl.checkFlightAvailability);

router.get("/test", HomeCtrl.test);

// delete unit test account after successful test
router.get("/delete-test", Register.deleteAccounts);
router.get("/update-account", Register.updateAccount);

module.exports = router;
