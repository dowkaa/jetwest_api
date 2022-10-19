const expresss = require("express");
const router = expresss.Router();
const passportss = require("passport");
require("dotenv").config();

const Register = require("../controllers/RegisterCtrl");
const LoginCtrl = require("../controllers/LoginCtrl");
const HomeCtrl = require("../controllers/HomeCtrl");

// Authentication
router.post("/register_step_one", Register.step1);
router.post("/register_activate", Register.step2);
router.post("/update_account", Register.step3);
router.post("/add_business", Register.addBusiness);
router.post("/update_business_compliance", Register.businessDocs);
router.post("/add_directors", Register.step4);
router.post("/login", LoginCtrl.Login);

//Home routes
router.get("/get_faqs", HomeCtrl.getFags);
router.get("/all_testimonials", HomeCtrl.getTestimonials);
router.post("/add_mail", HomeCtrl.postMailing);
router.get("/shipping_item", HomeCtrl.getShippingData);
router.get("/check_promo", HomeCtrl.checkPromo);

// delete unit test account after successful test
router.get("/delete-test", LoginCtrl.removeTest);
module.exports = router;
