"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const fs = require("fs");
const servers = require("../utils/server");
const app = require("../index.ts");
const path = require("path");
const utils = require("util");
// const readFile = utils.promisify(fs.readFile)
// try {
//     const authPath = path.resolve("./auth.txt");
//     return await readFile(authPath, "utf8")
// } catch (error) {
// }
let a = Math.floor(Math.random() * 1000000) + "test";
// const app = servers;
describe("API tests", () => {
    describe("Public routes", () => {
        describe("email validation", () => {
            it("it should return 200 if otp was sent successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                const option = {
                    email: `abelkellyofficial6022@gmail.com`,
                    otp: "123456",
                };
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/public/register_step_one")
                    .send(option);
                expect(statusCode).toBe(200);
                expect(body.success.message).toEqual("Your account was created successfully");
            }));
        });
        describe("email validation route", () => {
            it("it should return 200 if email was validated successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                const option = {
                    otp: "123456",
                };
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/public/register_activate")
                    .send(option);
                expect(statusCode).toBe(200);
                expect(body.message).toEqual("Your email has been verified successfully");
            }));
        });
        describe("persoanl info validation route", () => {
            it("it should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const option = {
                    company_name: "abelkelly",
                    country: "Nigeria",
                    primary_contact: "Lagos Nigeria",
                    password: "abelkelly",
                    fullname: "Abel Kalu",
                    phone_number: "07014149266",
                    secondary_contact: "Port Harcourt, Rivers State",
                    type: "Partner",
                    otp: "123456",
                };
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/public/register_step_two")
                    .send(option);
                expect(statusCode).toBe(200);
                expect(body.success.status).toEqual("SUCCESS");
            }));
        });
        describe("registration test", () => {
            it("it should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                // expect(true).toBe(true)
                const option = {
                    company_name: "abelkelly",
                    mobile_number: "07014149266",
                    primary_number: "07014149266",
                    country: "Nigeria",
                    address: "Lagos, Nigeria",
                    contact_fullname: "Abel Kalu",
                    postal_code: "100110",
                    secondary_number: "07014149266",
                    state: "Lagos",
                    otp: "123456",
                };
                // const jwt = "bfhjhgjhkmcsdscd"
                // await supertest(app).post("/api/jetwest/public/register").set("Authorization", `Bearer ${jwt}`).send("payload");
                // .post("/api/jetwest/public/register").send(user);
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/public/register_step_three")
                    .send(option);
                //   console.log({ token: body.success.token });
                // fs.writeFileSync("./tests/auth.txt", body.success.token);
                //   console.log({ body, statusCode });
                // code = body.otp
                expect(statusCode).toBe(200);
                expect(body.success.message).toEqual("Your account was created successfully");
            }));
        });
        // describe.only("User account activation", () => {
        //   it("it should return 200 response code if successful", async () => {
        //     const option = {
        //       otp: "123456",
        //       email: `abelkellyofficial6022@gmail.com`,
        //     };
        //     const { body, statusCode } = await supertest(app)
        //       .post("/api/jetwest/public/activate-account")
        //       .send(option);
        //     expect(statusCode).toBe(200);
        //   });
        // });
        describe("User login", () => {
            it("it should return 200 response code if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const option = {
                    password: "abelkelly",
                    email: `abelkellyofficial6022@gmail.com`,
                    type: "Partner",
                };
                console.log({ a });
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/public/login")
                    .send(option);
                console.log({ body });
                fs.writeFileSync("./tests/auth.txt", body.success.token);
                expect(statusCode).toBe(200);
            }));
        });
        describe("frequenty asked questions", () => {
            it("it should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const { body, statusCode } = yield (0, supertest_1.default)(app).get("/api/jetwest/auth/get_fags");
                // const readFile = utils.promisify(fs.readFile);
                // // try {
                // const authPath = path.resolve("./tests/auth.txt");
                // let auth = await readFile(authPath, "utf8");
                expect(statusCode).toBe(200);
                // expect(body.success).toEqual(auth);
            }));
        });
        describe("Testimonials", () => {
            it("it should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const { body, statusCode } = yield (0, supertest_1.default)(app).get("/api/jetwest/auth/all_testimonials");
                expect(statusCode).toBe(200);
            }));
        });
        describe("News letter endpoint", () => {
            it("it should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const option = {
                    email: `kaluabel76@gmail.com`,
                };
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/public/add_mail")
                    .send(option);
                expect(statusCode).toBe(200);
            }));
        });
        describe("Get shipment by ref id endpoint", () => {
            it("It should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const { body, statusCode } = yield (0, supertest_1.default)(app).get("/api/jetwest/auth/?refId=iokjhgffghjk");
                expect(statusCode).toBe(200);
            }));
        });
        describe("check promo endpoint", () => {
            it("it should return 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                const { body, statusCode } = yield (0, supertest_1.default)(app).get("/api/jetwest/auth/?refId=iokjhgffghjk");
                expect(statusCode).toBe(200);
            }));
        });
    });
    describe("Authenticated routes", () => {
        describe("Get profile", () => {
            it("it should return status code 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                // {{localhost}}/api/jetwest/auth/get-profile
                const readFile = utils.promisify(fs.readFile);
                // try {
                const authPath = path.resolve("./tests/auth.txt");
                let auth = yield readFile(authPath, "utf8");
                console.log({ auth });
                // } catch (error) {
                // }
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .get("/api/jetwest/auth/get-profile")
                    .set("Authorization", `Bearer ${auth}`)
                    .set("signatures", "oihcoiwcdbcwcuqdqwiudhduhubw") //<-- again
                    .set("Content-Type", "application/json");
                expect(statusCode).toBe(200);
            }));
        });
        describe("Request quote endpoint", () => {
            it("it should return status code 200 if successful", () => __awaiter(void 0, void 0, void 0, function* () {
                // {{localhost}}/api/jetwest/auth/get-profile
                const readFile = utils.promisify(fs.readFile);
                // try {
                const authPath = path.resolve("./tests/auth.txt");
                let auth = yield readFile(authPath, "utf8");
                console.log({ auth });
                // } catch (error) {
                // }
                const option = {
                    type: "Single",
                    company_name: "Abelkelly",
                    email: "abelkellyofficial6022@gmail.com",
                    primary_phone: "07014149266",
                    contact_fullname: "Abel Kalu",
                    phone_number: "09020269804",
                    secondary_phone: "09047597017",
                    length: "200",
                    width: "50",
                    heigth: "120",
                    weight: "90",
                    content: "Gold",
                    value: "20000",
                    pick_up: "V.I, Lagos",
                    destination: "Dallas, Texas",
                };
                const { body, statusCode } = yield (0, supertest_1.default)(app)
                    .post("/api/jetwest/auth/request_quote")
                    .set("Authorization", `Bearer ${auth}`)
                    .set("signatures", "oihcoiwcdbcwcuqdqwiudhduhubw") //<-- again
                    .set("Content-Type", "application/json")
                    .send(option);
                expect(statusCode).toBe(200);
                // delete test account after all test is done
                yield (0, supertest_1.default)(app).get(`/api/jetwest/public//delete-test?email=abelkellyofficial6022@gmail.com`);
            }));
        });
    });
});
