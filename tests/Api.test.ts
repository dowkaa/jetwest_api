import supertest from "supertest";
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
    describe("register_step_one", () => {
      it("it should return 200 if otp was sent successfully", async () => {
        const option = {
          first_name: "Abel",
          last_name: "Kalu",
          country: "Nigeria",
          email: "abelkellyofficial6022@gmail.com",
          notification_type: "email",
          password: "abelkelly",
          mobile: "07014149266",
          otp: "123456",
        };

        const { body, statusCode } = await supertest(app)
          .post("/api/jetwest/public/register_step_one")
          .send(option);

        console.log({ body, statusCode });

        expect(statusCode).toBe(200);
        expect(body.success.message).toEqual(
          "Kindly verify your email with the code sent to your email address to verify your registration "
        );
      });
    });

    describe("register_activate", () => {
      it("it should return 200 if email was validated successfully", async () => {
        const option = {
          otp: "123456",
        };

        const { body, statusCode } = await supertest(app)
          .post("/api/jetwest/public/register_activate")
          .send(option);

        expect(statusCode).toBe(200);
        expect(body.message).toEqual(
          "Your email has been verified successfully"
        );

        // const response = await supertest(app).get(
        //   "/api/jetwest/public/delete-test/?email=abelkellyofficial6022@gmail.com"
        // );

        // console.log({ response });
      });
    });

    describe("update_account", () => {
      it("it should return 200 if successful", async () => {
        const option = {
          organisation: "Fintech",
          company_name: "abelkelly",
          company_address: "Lagos, Nigeria",
          companyFounded: "20-11-1980",
          type: "Shipper",
          otp: "123456",
        };

        const { body, statusCode } = await supertest(app)
          .post("/api/jetwest/public/update_account")
          .send(option);

        expect(statusCode).toBe(200);
        expect(body.success.status).toEqual("SUCCESS");
      });
    });

    describe("add_business", () => {
      it("it should return 200 if successful", async () => {
        // expect(true).toBe(true)

        const option = {
          natureOf_biz: "Shipping",
          business_reg_num: "1234567890987654321",
          biz_tax_id: "wwww.cloudinary.com/res.kjo",
          country_of_incorporation: "Nigeria",
          incorporation_date: "11-20-1980",
          country_of_operation: "Nigeria",
          mobile: "+2349020269804",
          email: "abelkelly6022@gmail.com",
          otp: "123456",
        };
        // const jwt = "bfhjhgjhkmcsdscd"

        // await supertest(app).post("/api/jetwest/public/register").set("Authorization", `Bearer ${jwt}`).send("payload");

        // .post("/api/jetwest/public/register").send(user);

        const { body, statusCode } = await supertest(app)
          .post("/api/jetwest/public/add_business")
          .send(option);

        //   console.log({ token: body.success.token });

        // fs.writeFileSync("./tests/auth.txt", body.success.token);

        //   console.log({ body, statusCode });
        // code = body.otp

        expect(statusCode).toBe(200);
        expect(body.success.message).toEqual(
          "business data added successfully"
        );
      });
    });

    describe("update_business_compliance", () => {
      it("it should return 200 if successful", async () => {
        // expect(true).toBe(true)

        const option = {
          incoporation_doc_url: "www.cloudinary.com/resjhwhk",
          proofOf_biz_address_url: "www.cloudinary.com/resjhwhkhewiciujwck",
          guarantor_form_url: "www.cloudinary.com/resjhwhkiucwucndc",
          shareHolder_register_url: "www.cloudinary.com/resjhwhkshcwiuciwecoe",
          artOf_association: "www.cloudinary.com/resjhwhkkjrjfjifnewflebkf",
          memorandumOf_guidance_url: "www.cloudinary.com/resjhwhkmnbcjlcwc",
          email: "abelkelly6022@gmail.com",
        };
        // const jwt = "bfhjhgjhkmcsdscd"

        // await supertest(app).post("/api/jetwest/public/register").set("Authorization", `Bearer ${jwt}`).send("payload");

        // .post("/api/jetwest/public/register").send(user);

        const { body, statusCode } = await supertest(app)
          .post("/api/jetwest/public/update_business_compliance")
          .send(option);

        //   console.log({ token: body.success.token });

        // fs.writeFileSync("./tests/auth.txt", body.success.token);

        //   console.log({ body, statusCode });
        // code = body.otp

        expect(statusCode).toBe(200);
        expect(body.success.message).toEqual(
          "Business updated successfully; an email would be sent to your business email when the documents have been reviewed, Thanks."
        );
      });
    });

    //   describe("add_directors", () => {
    //     it("it should return 200 if successful", async () => {
    //       // expect(true).toBe(true)

    //       const option = {
    //         incoporation_doc_url: "www.cloudinary.com/resjhwhk",
    //         proofOf_biz_address_url: "www.cloudinary.com/resjhwhkhewiciujwck",
    //         guarantor_form_url: "www.cloudinary.com/resjhwhkiucwucndc",
    //         shareHolder_register_url: "www.cloudinary.com/resjhwhkshcwiuciwecoe",
    //         artOf_association: "www.cloudinary.com/resjhwhkkjrjfjifnewflebkf",
    //         memorandumOf_guidance_url: "www.cloudinary.com/resjhwhkmnbcjlcwc",
    //         email: "abelkelly6022@gmail.com",
    //       };
    //       // const jwt = "bfhjhgjhkmcsdscd"

    //       // await supertest(app).post("/api/jetwest/public/register").set("Authorization", `Bearer ${jwt}`).send("payload");

    //       // .post("/api/jetwest/public/register").send(user);

    //       const { body, statusCode } = await supertest(app)
    //         .post("/api/jetwest/public/add_directors")
    //         .send(option);

    //       //   console.log({ token: body.success.token });

    //       // fs.writeFileSync("./tests/auth.txt", body.success.token);

    //       //   console.log({ body, statusCode });
    //       // code = body.otp
    //       fs.writeFileSync("./tests/auth.txt", body.success.token);

    //       expect(statusCode).toBe(200);
    //       expect(body.success.message).toEqual(
    //         "directors data added successfully"
    //       );
    //     });
    //   });

    //   describe("User login", () => {
    //     it("it should return 200 response code if successful", async () => {
    //       const option = {
    //         password: "abelkelly",
    //         email: `abelkellyofficial6022@gmail.com`,
    //       };

    //       console.log({ a });

    //       const { body, statusCode } = await supertest(app)
    //         .post("/api/jetwest/public/login")
    //         .send(option);

    //       console.log({ body });

    //       fs.writeFileSync("./tests/auth.txt", body.success.token);

    //       expect(statusCode).toBe(200);
    //     });
    //   });

    //   describe("frequenty asked questions", () => {
    //     it("it should return 200 if successful", async () => {
    //       const { body, statusCode } = await supertest(app).get(
    //         "/api/jetwest/auth/get_fags"
    //       );

    //       // const readFile = utils.promisify(fs.readFile);

    //       // // try {
    //       // const authPath = path.resolve("./tests/auth.txt");
    //       // let auth = await readFile(authPath, "utf8");

    //       expect(statusCode).toBe(200);
    //       // expect(body.success).toEqual(auth);
    //     });
    //   });

    //   describe("Testimonials", () => {
    //     it("it should return 200 if successful", async () => {
    //       const { body, statusCode } = await supertest(app).get(
    //         "/api/jetwest/auth/all_testimonials"
    //       );

    //       expect(statusCode).toBe(200);
    //     });
    //   });

    //   describe("News letter endpoint", () => {
    //     it("it should return 200 if successful", async () => {
    //       const option = {
    //         email: `kaluabel76@gmail.com`,
    //       };
    //       const { body, statusCode } = await supertest(app)
    //         .post("/api/jetwest/public/add_mail")
    //         .send(option);

    //       expect(statusCode).toBe(200);
    //     });
    //   });
    //   describe("Get shipment by ref id endpoint", () => {
    //     it("It should return 200 if successful", async () => {
    //       const { body, statusCode } = await supertest(app).get(
    //         "/api/jetwest/auth/?refId=iokjhgffghjk"
    //       );

    //       expect(statusCode).toBe(200);
    //     });
    //   });
    //   describe("check promo endpoint", () => {
    //     it("it should return 200 if successful", async () => {
    //       const { body, statusCode } = await supertest(app).get(
    //         "/api/jetwest/auth/?refId=iokjhgffghjk"
    //       );

    //       expect(statusCode).toBe(200);
    //     });
    //   });
    // });

    // describe("Authenticated routes", () => {
    //   describe("Get profile", () => {
    //     it("it should return status code 200 if successful", async () => {
    //       // {{localhost}}/api/jetwest/auth/get-profile

    //       const readFile = utils.promisify(fs.readFile);

    //       // try {
    //       const authPath = path.resolve("./tests/auth.txt");
    //       let auth = await readFile(authPath, "utf8");
    //       // } catch (error) {

    //       // }
    //       const { body, statusCode } = await supertest(app)
    //         .get("/api/jetwest/auth/get-profile")
    //         .set("Authorization", `Bearer ${auth}`)
    //         .set("signatures", "oihcoiwcdbcwcuqdqwiudhduhubw") //<-- again
    //         .set("Content-Type", "application/json");

    //       expect(statusCode).toBe(200);
    //     });
    //   });

    //   describe("Request quote endpoint", () => {
    //     it("it should return status code 200 if successful", async () => {
    //       // {{localhost}}/api/jetwest/auth/get-profile

    //       const readFile = utils.promisify(fs.readFile);

    //       // try {
    //       const authPath = path.resolve("./tests/auth.txt");
    //       let auth = await readFile(authPath, "utf8");

    //       console.log({ auth });
    //       // } catch (error) {

    //       // }

    //       const option = {
    //         items: [
    //           {
    //             type: "Multiple",
    //             pickup_location: "Lagos, Nigeria",
    //             depature_date: "20-11-11",
    //             cargo_id: "polkjhggfhgjhkgnbgdhj",
    //             destination: "Maryland, USA",
    //             width: 500,
    //             length: 100,
    //             weight: 99,
    //             height: 88,
    //             category: "lIQUID",
    //             promo_code: "",
    //             value: 30000,
    //             content: "Diamond",
    //           },
    //         ],
    //       };

    //       const { body, statusCode } = await supertest(app)
    //         .post("/api/jetwest/auth/request_quote")
    //         .set("Authorization", `Bearer ${auth}`)
    //         .set("signatures", "oihcoiwcdbcwcuqdqwiudhduhubw") //<-- again
    //         .set("Content-Type", "application/json")
    //         .send(option);

    //       expect(statusCode).toBe(200);

    //       // delete test account after all test is done
    //       await supertest(app).get(
    //         `/api/jetwest/public//delete-test?email=abelkellyofficial6022@gmail.com`
    //       );
    //     });
    // });
  });
});
