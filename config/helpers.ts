const utilities = require("../utils/packages");
const db = require("../database/mysql");
const { Op } = require("sequelize");
import { Request, Response, NextFunction } from "express";

const sendError = (message: string) => {
  var error = {
    status: "ERROR",
    message,
  };

  return error;
};

let paystack_key: any;

if (process.env.STATE === "dev" || process.env.STATE === "test") {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
} else {
  paystack_key = process.env.PAYSTACK_LIVE_SECRET_KEY;
}

// give company admin access to resend team invite mail after 5 minutes
const updateInvite = async (req: any) => {
  setTimeout(async () => {
    const user = await db.dbs.Users.findOne({ where: { email: req } });
    if (user.invite_status !== 1) {
      user.invite_status = null;
      await user.save();
    }
  }, 1800000);
};

const paymentForShipmentBookingByReceipt = async (option: any) => {
  let shipment = await db.dbs.ShippingItems.findOne({
    where: { shipment_num: option.shipment_num },
  });
  let totalWeight = await db.dbs.ShippingItems.sum("volumetric_weight", {
    where: { shipment_num: option.shipment_num },
  });

  let payment = await db.dbs.Transactions.create({
    uuid: utilities.uuid(),
    user_id: option.user.id,
    amount: option.amount,
    reference: "nil",
    // previous_balance: checkBalance.amount,
    // new_balance: parseFloat(checkBalance.amount) - amount,
    amount_deducted: option.amount,
    departure: shipment.pickup_location,
    arrival: shipment.destination,
    cargo_id: shipment.cargo_id,
    departure_date: shipment.depature_date.split("/").reverse().join("-"),
    arrival_date: shipment.arrival_date,
    shipment_no: option.shipment_num,
    company_name: option.user.company_name,
    weight: totalWeight,
    reciever_organisation: shipment.reciever_organisation,
    pricePerkeg: shipment.pricePerKg,
    no_of_bags: shipment.no_of_bags,
    type: "credit",
    method: "wallet",
    description:
      "Payment for shipment booked on your behalf by the dowkaa system support.",
    status: "pending_verification",
  });

  await db.dbs.PaymentProofs.create({
    uuid: utilities.uuid(),
    user_id: option.user.id,
    proof_url: option.payment_doc_url,
    shipment_num: option.shipment_num,
    user_company: option.user.company_name,
    transaction_id: payment.id,
    status: "pending",
    amount: parseFloat(option.amount),
  });

  let admin = await db.dbs.Users.findAll({
    where: {
      admin_type: {
        [Op.in]: ["Revenue Officer", "Super Admin"],
      },
    },
  });

  let arr = [];

  for (const ad of admin) {
    arr.push(ad.email);
  }

  const opts = {
    name: "Revenue Officer",
    email: arr,
    message:
      "A customer has uploaded a payment document for shipment booked by a customer support admin person on the admin backend. Kindly check through and verify payment",
  };

  try {
    utilities.paymentValidation.sendMail(opts);
  } catch (error: any) {
    console.log({ error });
  }
};

const checkBaggageConfirmation = async (option: any) => {
  setInterval(async () => {
    const notConfirmedShipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num: option.shipment_num, is_confirmed: false },
    });
    if (notConfirmedShipment) {
      let flight = await db.db.ScheduleFlights.findOne({
        where: { id: notConfirmedShipment.flight_id },
      });

      if (
        flight.stod - Date.now() < 15000000 ||
        flight.stod - Date.now() >= 14400000
      ) {
        utilities.beforeTakeOff(option);
      }
    }
  }, 600000);
};

const validateHarsh = async (secret: string, user_id: string) => {
  let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

  let encryptCheck = secret + user.customer_id;

  const harsh = utilities.crypto
    .createHash("sha256")
    .update(encryptCheck)
    .digest("hex");

  let checker = await db.dbs.ApiKeys.findOne({
    where: { user_id: user.id },
  });

  if (harsh === checker.api_key) {
    return user;
  }
  return null;
};

const logApiTransaction = async (
  customer_id: string,
  amount: number,
  shipment_num: any,
  message: string,
  data: any
) => {
  let user = await db.dbs.Users.findOne({
    where: { customer_id: customer_id },
  });

  let checkBalance = await db.dbs.Wallets.findOne({
    where: { user_id: user.id },
  });

  checkBalance.amount = parseFloat(checkBalance.amount) - amount;
  checkBalance.amount_deducted = amount;
  await checkBalance.save();

  let item = await db.dbs.ShippingItems.findOne({
    where: { shipment_num: shipment_num },
  });

  await db.dbs.Transactions.create({
    uuid: utilities.uuid(),
    user_id: user.id,
    amount: amount,
    reference: "nil",
    previous_balance: checkBalance.amount,
    new_balance: parseFloat(checkBalance.amount) - amount,
    amount_deducted: amount,
    departure: item.pickup_location,
    arrival: item.destination,
    cargo_id: item.cargo_id,
    departure_date: item.depature_date.split("/").reverse().join("-"),
    arrival_date: item.arrival_date,
    shipment_no: shipment_num,
    company_name: user.company_name,
    weight: item.weight,
    reciever_organisation: item.reciever_organisation,
    pricePerkeg: item.pricePerKg,
    no_of_bags: data.length,
    type: "credit",
    method: "wallet",
    description: message,
    status: "success",
  });
};

const checkMail = async (req: any) => {
  return await db.dbs.Users.findOne({ where: { email: req.body.email } });
};

const checkUserTransaction = async (reference: string) => {
  return await db.dbs.Transactions.findOne({ where: { reference: reference } });
};

const validateTransaction = async (data: any, type: string) => {
  if (type === "payment") {
    var validateTransaction = await utilities.helpers.checkUserTransaction(
      data.reference
    );

    if (validateTransaction) {
      return;
    }

    let paystackCheck = await db.dbs.PaystackStarter.findOne({
      where: { reference: data.reference },
    });

    if (!paystackCheck) {
      await db.dbs.PaystackStarter.create({
        reference: data.reference,
        status: "pending",
        user_id: data.customer_id,
      });
    }

    var url = `https://api.paystack.co/transaction/verify/${data.reference}`;

    var option = {
      method: "get",
      url: url,
      headers: {
        Authorization: `Bearer ${paystack_key}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "application/json",
      },
    };

    try {
      const result = await utilities.axios(option);

      if (result.data.data.status == "success") {
        console.log({ data1: data, data });
        try {
          var amount = result.data.data.amount / 100;

          let shipment = await db.dbs.ShippingItems.findOne({
            where: { shipment_num: data.shipment_num },
          });

          let checkT = await db.dbs.Transactions.findOne({
            where: {
              reference: data.reference,
            },
          });

          let user = await db.dbs.Users.findOne({ where: { id: data.id } });

          if (!checkT) {
            let t = await db.dbs.Transactions.create({
              uuid: utilities.uuid(),
              user_id: data.id,
              amount: amount,
              reference: data.reference,
              departure: shipment.pickup_location,
              arrival: shipment.destination,
              cargo_id: shipment.cargo_id,
              departure_date: shipment.depature_date,
              arrival_date: shipment.arrival_date,
              company_name: data.company_name,
              shipment_no: data.shipment_num,
              weight:
                parseFloat(shipment.volumetric_weight) >
                parseFloat(shipment.weight)
                  ? shipment.volumetric_weight
                  : shipment.weight,
              reciever_organisation: shipment.reciever_organisation,
              pricePerkeg: shipment.ratePerKg,
              no_of_bags: shipment.no_of_bags,
              type: "credit",
              method: "paystack",
              description: `Payment for shipment with no ${shipment.shipment_num}`,
              status: "success",
            });

            await db.dbs.CustomerAuditLog.create({
              uuid: utilities.uuid(),
              user_id: user.id,
              description: `A user with name ${user.first_name} ${user.last_name} payment of the sum of ${amount} using the paystack checkout was successful`,
              data: JSON.stringify(t),
            });

            let checker = await db.dbs.PaystackStarter.findOne({
              where: { reference: data.reference },
            });

            if (checker) {
              checker.status = "success";
              await checker.save();
            }

            await db.dbs.ShippingItems.update(
              { payment_status: "SUCCESS" },
              {
                where: {
                  reference: data.reference,
                },
              }
            );
          }

          if (shipment.agent_id) {
            let checker = await db.dbs.Users.findOne({
              where: { id: shipment.agent_id },
            });

            const opts1 = {
              name: checker.first_name + " " + checker.last_name,
              email: checker.email,
              shipment_num: shipment.shipment_num,
            };
            utilities.agent.sendMail(opts1);
          }

          const opts2 = {
            name:
              shipment.reciever_firstname + " " + shipment.reciever_lastname,
            email: shipment.reciever_email,
            shipment_num: shipment.shipment_num,
            shipper_name: shipment.shipperName,
            arrival_date: shipment.arrival_date,
          };

          const opts3 = {
            email: user.email,
            name: user.shipperName,
            amount: amount,
            shipment_ref: shipment.booking_reference,
          };
          utilities.reciever.sendMail(opts2);
          utilities.paymentSuccess.sendMail(opts3);

          return "success";
        } catch (error: any) {
          console.log({ error1: error });
          await db.dbs.PaystackError.create({
            uuid: utilities.uuid(),
            data: JSON.stringify(error.response.data),
          });

          return "error";
        }
      } else {
        console.log({ data2: data, data });
        try {
          var amount = result.data.data.amount / 100;

          let shipment = await db.dbs.ShippingItems.findOne({
            where: { shipment_num: data.shipment_num },
          });

          let checkT = await db.dbs.Transactions.findOne({
            where: {
              reference: data.reference,
            },
          });

          if (!checkT) {
            let t = await db.dbs.Transactions.create({
              uuid: utilities.uuid(),
              user_id: data.id,
              amount: amount,
              reference: data.reference,
              departure: shipment.pickup_location,
              arrival: shipment.destination,
              departure_date: shipment.depature_date,
              company_name: data.company_name,
              arrival_date: shipment.arrival_date,
              shipment_no: data.shipment_num,
              weight:
                parseFloat(shipment.volumetric_weight) >
                parseFloat(shipment.weight)
                  ? shipment.volumetric_weight
                  : shipment.weight,
              pricePerkeg: shipment.ratePerKg,
              reciever_organisation: shipment.reciever_organisation,
              no_of_bags: shipment.no_of_bags,
              type: "credit",
              method: "paystack",
              description: `Payment for shipment with no ${shipment.shipment_num}`,
              status: "failed",
            });

            let user = await db.dbs.Users.findOne({ where: { id: data.id } });

            await db.dbs.CustomerAuditLog.create({
              uuid: utilities.uuid(),
              user_id: user.id,
              description: `A user with name ${user.first_name} ${user.last_name} payment of the sum of ${amount} using the paystack checkout failed`,
              data: JSON.stringify(t),
            });

            let checker = await db.dbs.PaystackStarter.findOne({
              where: { reference: data.reference },
            });

            if (checker) {
              checker.status = "failed";
              await checker.save();
            }

            await db.dbs.ShippingItems.update(
              { payment_status: "FAILED" },
              {
                where: {
                  reference: data.reference,
                },
              }
            );
          }
          return "failed";
        } catch (error: any) {
          console.log({ error2: error });
          await db.dbs.PaystackError.create({
            uuid: utilities.uuid(),
            data: JSON.stringify(error.response.data),
          });

          return "error";
        }
      }
    } catch (err: any) {
      console.log({ err, message: err.response.data });
      await db.dbs.PaystackError.create({
        uuid: utilities.uuid(),
        data: JSON.stringify(err.response.data),
      });

      return "failed";
    }
  } else {
    var validateTransaction = await utilities.helpers.checkUserTransaction(
      data.reference
    );

    if (validateTransaction) {
      return "exists";
    }

    let paystackCheck = await db.dbs.PaystackStarter.findOne({
      where: { reference: data.reference },
    });

    if (!paystackCheck) {
      await db.dbs.PaystackStarter.create({
        reference: data.reference,
        status: "pending",
        user_id: data.customer_id,
      });
    }

    var url = `https://api.paystack.co/transaction/verify/${data.reference}`;

    var option = {
      method: "get",
      url: url,
      headers: {
        Authorization: `Bearer ${paystack_key}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "application/json",
      },
    };

    try {
      const result = await utilities.axios(option);

      if (result.data.data.status == "success") {
        try {
          var amount = result.data.data.amount / 100;

          await db.dbs.ShippingItems.update(
            { payment_status: "SUCCESS" },
            { where: { shipment_num: data.shipment_num } }
          );

          let transaction = await db.dbs.Transactions.findOne({
            where: { shipment_no: data.shipment_num },
          });

          if (amount < parseFloat(transaction.amount)) {
            return "Amount paid is less than amount charged for shipments, kindly contact customer support.";
          }

          transaction.reference = data.reference;
          transaction.type = "credit";
          transaction.method = "paystack";
          transaction.status = "success";
          await transaction.save();

          return "success";
        } catch (error: any) {
          await db.dbs.PaystackError.create({
            uuid: utilities.uuid(),
            data: JSON.stringify(error.response.data),
          });

          return "error";
        }
      } else {
        try {
          var amount = result.data.data.amount / 100;

          let transaction = await db.dbs.Transactions.findOne({
            where: { shipment_no: data.shipment_num },
          });

          transaction.reference = data.reference;
          transaction.type = "credit";
          transaction.method = "paystack";
          transaction.status = "failed";
          await transaction.save();

          return "failed";
        } catch (error: any) {
          await db.dbs.PaystackError.create({
            uuid: utilities.uuid(),
            data: JSON.stringify(error.response.data),
          });

          return "error";
        }
      }
    } catch (err: any) {
      await db.dbs.PaystackError.create({
        uuid: utilities.uuid(),
        data: JSON.stringify(err.response.data),
      });

      return err.response.data.message;
    }
  }
};

// const check = async (req: any, userChecker: any, res: Response) => {
//   let checkBalance = await db.dbs.Wallets.findOne({
//     where: { user_id: userChecker.id },
//   });

//   if (parseFloat(checkBalance.amount) < price) {
//     let checkTransactionTotal = await db.dbs.Transactions.sum("amount", {
//       where: { user_id: req.user.id },
//     });

//     if (checkTransactionTotal < 1000000) {
//       let resp = await utilities.helpers.logPendingShipment(
//         req.body,
//         res,
//         item
//       );

//       const option = {
//         email: req.user.email,
//         name: req.user.first_name + " " + req.user.last_name,
//       };

//       util.shipperAPI.sendMail(option);

//       console.log({ resp1: resp });
//     } else {
//       let userWallet = await db.dbs.Wallets.findOne({
//         where: { user_id: req.user.id },
//       });

//       if (parseFloat(userWallet.amount_owed) < 10) {
//         let resp = await util.helpers.addShipmentAndCreditUser(
//           req.body,
//           res,
//           req.user.id,
//           item
//         );

//         const option = {
//           email: req.user.email,
//           name: req.user.first_name + " " + req.user.last_name,
//         };

//         util.SuperShipperAPIMail.sendMail(option);

//         console.log({ resp2: resp });
//       } else {
//         let resp = await util.helpers.logPendingShipment(req.body, res, item);

//         console.log({ resp3: resp });
//       }
//     }
//   }

//   await db.dbs.Transactions.create({
//     uuid: util.uuid(),
//     user_id: req.user.id,
//     amount: price,
//     reference: "nil",
//     previous_balance: checkBalance.amount,
//     new_balance: parseFloat(checkBalance.amount) - price,
//     amount_deducted: price,
//     departure: pickup_location,
//     arrival: destination,
//     cargo_id: cargo.cargo_id,
//     departure_date: depature_date.split("/").reverse().join("-"),
//     arrival_date: v.arrival_date,
//     shipment_no: shipment_num,
//     company_name: req.user.company_name,
//     weight: volumetric_weight > parseFloat(weight) ? volumetric_weight : weight,
//     reciever_organisation: reciever_organisation,
//     pricePerkeg: route.ratePerKg,
//     no_of_bags: items.length,
//     type: "credit",
//     method: "wallet",
//     description: `Payment for shipment with no ${shipment_num}`,
//     status: "success",
//   });

//   checkBalance.amount = parseFloat(checkBalance.amount) - price;
//   checkBalance.amount_deducted = price;
//   await checkBalance.save();
// };

const addShipmentAndCreditUser = async (
  req: any,
  res: Response,
  user_id: number,
  item: any
) => {
  const {
    items,
    pickup_location,
    destination,
    stod,
    total_weight,
    agent_id,
    payment_ref,
    reciever_email,
    total_amount,
    reciever_firstname,
    reciever_lastname,
    reciever_organisation,
    reciever_primaryMobile,
    reciever_secMobile,
  } = req.body;
  let shipment_num = utilities.helpers.generateReftId(10);
  let scan_code = utilities.helpers.generateReftId(10);

  if (agent_id) {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: agent_id },
    });

    if (!checker) {
      return res
        .status(400)
        .json(utilities.helpers.sendError("Agent not found"));
    }
  }

  let checkShipment = await db.dbs.ShippingItems.findOne({
    where: { shipment_num },
  });

  if (checkShipment) {
    shipment_num = utilities.helpers.generateReftId(10);
  }

  let v = await db.dbs.ScheduleFlights.findOne({
    where: {
      departure_station: pickup_location,
      destination_station: destination,
      stod: stod,
    },
  });

  if (!v) {
    let resp = {
      status: 400,
      message:
        "Flight not available, kindly check up other flights with other stod, or reduce the number of items to be shipped for this flight",
    };

    return resp;
    // if no available flight then save the data to a table for pending luggage and sent mail to admin that will
  }

  if (v.available_capacity < parseInt(total_weight)) {
    let resp = {
      status: 400,
      message:
        "Flight not availbale to carry total weight, kindly book another flight or contact customer support",
    };
    return resp;
  }

  if (Date.parse(stod) - new Date().getTime() <= 1079999) {
    let resp = {
      status: 400,
      message: "Flight not available for booking, already in transit",
    };
    return resp;
  }

  if (v.status !== "pending") {
    let resp = {
      status: 400,
      message: "Flight not available",
    };
    return resp;
  }

  for (const index of item) {
    let price;
    const {
      type,
      width,
      height,
      weight,
      length,
      shipment_ref,
      category,
      ba_code_url,
      promo_code,
      depature_date,
      value,
      content,
    } = index;

    let route = await db.dbs.ShipmentRoutes.findOne({
      where: { destination_name: destination },
    });

    if (!route) {
      let resp = {
        status: 400,
        message: "Route not found",
      };
      return resp;
    }

    let cargo = await db.dbs.Cargo.findOne({
      where: { flight_reg: v.flight_reg },
    });

    if (!cargo) {
      let resp = {
        status: 400,
        message:
          "Aircraft with flight registration number ${v.flight_reg} not found",
      };
      return resp;
    }

    let chargeable_weight;
    let volumetric_weight =
      (parseInt(width) * parseInt(height) * parseInt(length)) / 5000;

    chargeable_weight =
      volumetric_weight > parseInt(weight)
        ? volumetric_weight
        : parseInt(weight);

    if (category === "fragile") {
      price = chargeable_weight * parseFloat(route.ratePerKg);
      let price1 = price * (parseFloat(route.sur_charge) / 100);
      let price2 = price * (parseFloat(route.tax) / 100);
      let price3 = value * (parseFloat(route.insurance) / 100);
      let totalPrice = price + price1 + price2 + price3;
      price = totalPrice;
    } else {
      price = chargeable_weight * parseFloat(route.ratePerKg);
      let price1 = price * (parseFloat(route.sur_charge) / 100);
      let price2 = price * (parseFloat(route.tax) / 100);
      let totalPrice = price + price1 + price2;
      price = totalPrice;
    }

    if (parseInt(weight) > volumetric_weight) {
      if (parseFloat(v.available_capacity) - parseFloat(weight) < 0) {
        let resp = {
          status: 400,
          message: "Cannot book shipment aircraft capacity not enough",
        };
        return resp;
      }
      v.available_capacity =
        parseFloat(v.available_capacity) - parseFloat(weight);
      v.totalAmount = parseFloat(v.totalAmount) + price;
      v.taw = parseFloat(v.taw) + parseFloat(weight);
      await v.save();
    } else {
      if (parseFloat(v.available_capacity) - volumetric_weight < 0) {
        let resp = {
          status: 400,
          message: "Cannot book shipment aircraft capacity not enough",
        };
        return resp;
      }
      v.available_capacity =
        parseFloat(v.available_capacity) - volumetric_weight;
      v.taw = parseFloat(v.taw) + volumetric_weight;
      v.totalAmount = parseFloat(v.totalAmount) + price;
      await v.save();
    }

    price = price * parseFloat(route.dailyExchangeRate);

    if (agent_id) {
      let agent = await db.dbs.Users.findOne({
        where: { uuid: agent_id },
      });
      let status = await db.dbs.ShippingItems.create({
        uuid: utilities.uuid(),
        flight_id: v.id,
        type,
        user_id: req.user.id,
        agent_id: agent.id,
        shipment_num,
        reference: payment_ref,
        value,
        pickup_location,
        chargeable_weight,
        cargo_id: cargo.id,
        destination,
        depature_date: depature_date.split("/").reverse().join("-"),
        width,
        length: length,
        height,
        sur_charge: route.sur_charge,
        taxes: route.tax,
        book_type: "Personal",
        status: "pending",
        shipment_routeId: route.id,
        scan_code,
        weight,
        ratePerKg: route.ratePerKg,
        logo_url: v.logo_url,
        arrival_date: v.arrival_date,
        booking_reference: shipment_ref,
        volumetric_weight,
        company_name: req.user.company_name,
        payment_status: "paid",
        price: price,
        category,
        ba_code_url,
        promo_code: promo_code ? promo_code : null,
        shipperName: req.user.first_name + " " + req.user.last_name,
        organisation: req.user.organisation,
        shipperNum: req.user.customer_id,
        no_of_bags: req.body.items.length,
        content,
        reciever_firstname,
        reciever_lastname,
        reciever_email,
        reciever_organisation,
        reciever_primaryMobile,
        reciever_secMobile,
      });
      // utilities.helpers.removeShipment(status.uuid);
    } else {
      let status = await db.dbs.ShippingItems.create({
        uuid: utilities.uuid(),
        flight_id: v.id,
        type,
        user_id: req.user.id,
        shipment_num,
        reference: payment_ref,
        value,
        pickup_location,
        chargeable_weight,
        cargo_id: cargo.id,
        destination,
        depature_date: depature_date.split("/").reverse().join("-"),
        width,
        length: length,
        height,
        sur_charge: route.sur_charge,
        taxes: route.tax,
        book_type: "Personal",
        status: "pending",
        shipment_routeId: route.id,
        scan_code,
        weight,
        ratePerKg: route.ratePerKg,
        logo_url: v.logo_url,
        arrival_date: v.arrival_date,
        booking_reference: shipment_ref,
        volumetric_weight,
        company_name: req.user.company_name,
        payment_status: "paid",
        price: price,
        category,
        ba_code_url,
        promo_code: promo_code ? promo_code : null,
        shipperName: req.user.first_name + " " + req.user.last_name,
        organisation: req.user.organisation,
        shipperNum: req.user.customer_id,
        no_of_bags: req.body.items.length,
        content,
        reciever_firstname,
        reciever_lastname,
        reciever_email,
        reciever_organisation,
        reciever_primaryMobile,
        reciever_secMobile,
      });

      // utilities.helpers.removeShipment(status.uuid);
    }

    // let checkBalance = await db.dbs.Wallets.findOne({
    //   where: { user_id: req.user.id },
    // });

    // await db.dbs.Transactions.create({
    //   uuid: utilities.uuid(),
    //   user_id: req.user.id,
    //   amount: price,
    //   reference: "nil",
    //   previous_balance: checkBalance.amount,
    //   new_balance: parseFloat(checkBalance.amount) - price,
    //   amount_deducted: price,
    //   departure: pickup_location,
    //   arrival: destination,
    //   cargo_id: cargo.id,
    //   departure_date: depature_date.split("/").reverse().join("-"),
    //   arrival_date: v.arrival_date,
    //   shipment_no: shipment_num,
    //   company_name: req.user.company_name,
    //   weight:
    //     volumetric_weight > parseFloat(weight) ? volumetric_weight : weight,
    //   reciever_organisation: reciever_organisation,
    //   pricePerkeg: route.ratePerKg,
    //   no_of_bags: items.length,
    //   type: "credit",
    //   method: "wallet",
    //   description: `On credit Payment for shipment with no ${shipment_num} of the sum of ${price} to be deducted upon next wallet deposit`,
    //   status: "success",
    // });
  }

  utilities.helpers.logApiTransaction(
    req.user.customer_id,
    total_amount,
    shipment_num,
    `On credit Payment for shipment with no ${shipment_num} of the sum of ${total_amount} to be deducted upon next wallet deposit`,
    items
  );

  v.no_of_bags = parseInt(v.no_of_bags) + items.length;
  await v.save();

  // log shipment price to shipper's wallet as amount owed
  let userWallet = await db.dbs.Wallets.findOne({
    where: { user_id: req.user.id },
  });

  userWallet.amount_owed =
    parseFloat(userWallet.amount_owed) + parseFloat(total_amount);

  await userWallet.save();

  let resp = {
    status: 200,
    message:
      "Shipment booked successfully, though you do not have sufficient balance to book this shipment so the amount has been credited to your account and will be deducted upon your next wallet funding.",
  };
  return resp;
};

const logPendingShipment = async (req: any, res: Response, item: any) => {
  const {
    items,
    pickup_location,
    destination,
    stod,
    total_weight,
    agent_id,
    payment_ref,
    reciever_email,
    total_amount,
    reciever_firstname,
    reciever_lastname,
    reciever_organisation,
    reciever_primaryMobile,
    reciever_secMobile,
  } = req.body;
  let shipment_num = utilities.helpers.generateReftId(10);
  let scan_code = utilities.helpers.generateReftId(10);

  if (agent_id) {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: agent_id },
    });

    if (!checker) {
      let resp = {
        status: 400,
        message: "Agent not found",
      };
      return resp;
    }
  }

  let checkShipment = await db.dbs.ShippingItems.findOne({
    where: { shipment_num },
  });

  if (checkShipment) {
    shipment_num = utilities.helpers.generateReftId(10);
  }

  let v = await db.dbs.ScheduleFlights.findOne({
    where: {
      departure_station: pickup_location,
      destination_station: destination,
      stod: stod,
    },
  });

  if (!v) {
    let resp = {
      status: 400,
      message:
        "Flight not available, kindly check up other flights with other stod, or reduce the number of items to be shipped for this flight",
    };
    return resp;
    // if no available flight then save the data to a table for pending luggage and sent mail to admin that will
  }

  if (v.available_capacity < parseInt(total_weight)) {
    let resp = {
      status: 400,
      message:
        "Flight not availbale to carry total weight, kindly book another flight or contact customer support",
    };
    return resp;
  }

  if (Date.parse(stod) - new Date().getTime() <= 1079999) {
    let resp = {
      status: 400,
      message: "Flight not available for booking, already in transit",
    };
    return resp;
  }

  if (v.status !== "pending") {
    let resp = {
      status: 400,
      message: "Flight not available",
    };
    return resp;
  }

  for (const index of item) {
    let price;
    const {
      type,
      width,
      height,
      weight,
      length,
      shipment_ref,
      category,
      ba_code_url,
      promo_code,
      depature_date,
      value,
      content,
    } = index;

    let route = await db.dbs.ShipmentRoutes.findOne({
      where: { destination_name: destination },
    });

    if (!route) {
      let resp = {
        status: 400,
        message: "Route not found",
      };
      return resp;
    }

    let cargo = await db.dbs.Cargo.findOne({
      where: { flight_reg: v.flight_reg },
    });

    if (!cargo) {
      let resp = {
        status: 400,
        message: `Aircraft with flight registration number ${v.flight_reg} not found`,
      };
      return resp;
    }

    let chargeable_weight;
    let volumetric_weight =
      (parseInt(width) * parseInt(height) * parseInt(length)) / 5000;

    chargeable_weight =
      volumetric_weight > parseInt(weight)
        ? volumetric_weight
        : parseInt(weight);

    if (category === "fragile") {
      price = chargeable_weight * parseFloat(route.ratePerKg);
      let price1 = price * (parseFloat(route.sur_charge) / 100);
      let price2 = price * (parseFloat(route.tax) / 100);
      let price3 = value * (parseFloat(route.insurance) / 100);
      let totalPrice = price + price1 + price2 + price3;
      price = totalPrice;
    } else {
      price = chargeable_weight * parseFloat(route.ratePerKg);
      let price1 = price * (parseFloat(route.sur_charge) / 100);
      let price2 = price * (parseFloat(route.tax) / 100);
      let totalPrice = price + price1 + price2;
      price = totalPrice;
    }

    if (parseInt(weight) > volumetric_weight) {
      if (parseFloat(v.available_capacity) - parseFloat(weight) < 0) {
        let resp = {
          status: 400,
          message: "Cannot book shipment aircraft capacity not enough",
        };
        return resp;
      }
      v.available_capacity =
        parseFloat(v.available_capacity) - parseFloat(weight);
      v.totalAmount = parseFloat(v.totalAmount) + price;
      v.taw = parseFloat(v.taw) + parseFloat(weight);
      await v.save();
    } else {
      if (parseFloat(v.available_capacity) - volumetric_weight < 0) {
        let resp = {
          status: 400,
          message: "Cannot book shipment aircraft capacity not enough",
        };
        return resp;
      }
      v.available_capacity =
        parseFloat(v.available_capacity) - volumetric_weight;
      v.taw = parseFloat(v.taw) + volumetric_weight;
      v.totalAmount = parseFloat(v.totalAmount) + price;
      await v.save();
    }

    price = price * parseFloat(route.dailyExchangeRate);

    if (agent_id) {
      let agent = await db.dbs.Users.findOne({
        where: { uuid: agent_id },
      });
      let status = await db.dbs.ShippingItems.create({
        uuid: utilities.uuid(),
        flight_id: v.id,
        type,
        user_id: req.user.id,
        agent_id: agent.id,
        shipment_num,
        reference: payment_ref,
        value,
        pickup_location,
        chargeable_weight,
        cargo_id: cargo.id,
        destination,
        depature_date: depature_date.split("/").reverse().join("-"),
        width,
        length: length,
        height,
        sur_charge: route.sur_charge,
        taxes: route.tax,
        book_type: "Personal",
        status: "pending",
        shipment_routeId: route.id,
        scan_code,
        weight,
        ratePerKg: route.ratePerKg,
        logo_url: v.logo_url,
        arrival_date: v.arrival_date,
        booking_reference: shipment_ref,
        volumetric_weight,
        company_name: req.user.company_name,
        payment_status: "pending",
        price: price,
        category,
        ba_code_url,
        promo_code: promo_code ? promo_code : null,
        shipperName: req.user.first_name + " " + req.user.last_name,
        organisation: req.user.organisation,
        shipperNum: req.user.customer_id,
        no_of_bags: req.body.items.length,
        content,
        reciever_firstname,
        reciever_lastname,
        reciever_email,
        reciever_organisation,
        reciever_primaryMobile,
        reciever_secMobile,
      });
      utilities.helpers.removeShipment(status.uuid);
    } else {
      let status = await db.dbs.ShippingItems.create({
        uuid: utilities.uuid(),
        flight_id: v.id,
        type,
        user_id: req.user.id,
        shipment_num,
        reference: payment_ref,
        value,
        pickup_location,
        chargeable_weight,
        cargo_id: cargo.id,
        destination,
        depature_date: depature_date.split("/").reverse().join("-"),
        width,
        length: length,
        height,
        sur_charge: route.sur_charge,
        taxes: route.tax,
        book_type: "Personal",
        status: "pending",
        shipment_routeId: route.id,
        scan_code,
        weight,
        ratePerKg: route.ratePerKg,
        logo_url: v.logo_url,
        arrival_date: v.arrival_date,
        booking_reference: shipment_ref,
        volumetric_weight,
        company_name: req.user.company_name,
        payment_status: "pending",
        price: price,
        category,
        ba_code_url,
        promo_code: promo_code ? promo_code : null,
        shipperName: req.user.first_name + " " + req.user.last_name,
        organisation: req.user.organisation,
        shipperNum: req.user.customer_id,
        no_of_bags: req.body.items.length,
        content,
        reciever_firstname,
        reciever_lastname,
        reciever_email,
        reciever_organisation,
        reciever_primaryMobile,
        reciever_secMobile,
      });

      utilities.helpers.removeShipment(status.uuid);
    }
  }

  // utilities.helpers.logApiTransaction(
  //   req.user.customer_id,
  //   total_amount,
  //   shipment_num
  // );

  v.no_of_bags = parseInt(v.no_of_bags) + items.length;
  await v.save();

  let resp = {
    status: 200,
    message:
      "Shipment moved to pending as you have insufficient funds in your wallet, kindly fund your wallet and make payment. This shipment will be discarded in an our time",
  };
  return resp;
};

const removeShipment = async (param: string) => {
  setTimeout(async () => {
    let shipment = await db.dbs.ShippingItems.findOne({
      where: { uuid: param },
    });

    let v = await db.dbs.ScheduleFlights.findOne({
      where: {
        id: shipment.flight_id,
      },
    });

    v.taw = parseFloat(v.taw) - parseFloat(shipment.chargeable_weight);
    v.totalAmount = parseFloat(v.totalAmount) - parseFloat(shipment.price);
    await v.save();

    await db.dbs.ShippingItems.destroy({
      where: { uuid: param, payment_status: "pending" },
    });
    // }, 200000);
  }, 3600000);
};

const updateShipment = async (data: any) => {
  await db.dbs.ShippingItems.update(
    { progress: "in-transit" },
    {
      where: {
        flight_id: data.uuid,
      },
    }
  );

  // let shipments = await db.dbs.ShippingItems.findAll({
  //   where: {
  //     flight_id: data.uuid,
  //   },
  // });

  // for (const item of shipments) {
  //   let shipment = await db.dbs.ShippingItems.findOne({
  //     where: {
  //       uuid: item.uuid,
  //     },
  //   });

  //   shipment.progress = "in-transit";
  //   await shipment.save();
  // }
};

const deactivateOtp = async (param: string) => {
  if (param.includes("@")) {
    let user = await db.dbs.Users.findOne({ where: { email: param } });

    setTimeout(async () => {
      user.otp = null;
      await user.save();
    }, 240000);
  } else {
    let user = await db.dbs.Users.findOne({ where: { mobile_number: param } });

    setTimeout(async () => {
      user.otp = null;
      await user.save();
    }, 240000);
  }
};

const deactivatePassword = async (email: string) => {
  let user = await db.dbs.Users.findOne({ where: { email: email } });

  setTimeout(async () => {
    user.password = null;
    await user.save();
  }, 600000);
};

const checkMobile = async (req: any) => {
  return await db.dbs.Users.findOne({
    where: { mobile_number: req.body.mobile },
  });
};

const timestamp = (async: any) => {
  return (Date.now() / 1000) | 0;
};

const sendSuccess = (message: string) => {
  var success = {
    status: "SUCCESS",
    message,
  };

  return success;
};

const checkPromo = async (code: string) => {
  let checker = await db.dbs.Promotions.findOne({
    where: { code: code },
  });

  if (!checker) {
    const option = {
      message: "Invalid promo code",
      checker,
    };
    return option;
  }

  if (checker.is_active === 0) {
    const option = {
      message: "Promo is not active",
      checker,
    };
    return option;
  }

  let currentDate = Date.now();
  let startDate = Date.parse(checker.startDate);
  let endDate = Date.parse(checker.endDate);

  if (currentDate < startDate) {
    const option = {
      message: "Promo not yet started",
      checker,
    };
    return option;
  }

  if (currentDate >= startDate && currentDate < endDate) {
    const option = {
      message: "Promo is currently ongoing",
      checker,
    };
    return option;
  }

  if (currentDate > endDate && currentDate > startDate) {
    const option = {
      message: "Promo has elapsed",
      checker,
    };
    return option;
  }

  return "invalid";
};

const generateClientId = (length: number) => {
  var result = "";
  var characters = "123456789123456789123456789";
  var charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const generateReftId = (length: number) => {
  var result = "";
  var characters =
    "abcdefghijklmnopqrstuvwxyz1234567891234ABCDEFGHIJKLMNOPQRSTUVWXYZ56789123456789";
  var charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

module.exports = {
  sendError,
  checkUserTransaction,
  generateClientId,
  sendSuccess,
  generateReftId,
  validateHarsh,
  deactivateOtp,
  validateTransaction,
  paymentForShipmentBookingByReceipt,
  removeShipment,
  checkBaggageConfirmation,
  logPendingShipment,
  addShipmentAndCreditUser,
  updateInvite,
  updateShipment,
  logApiTransaction,
  checkPromo,
  checkMobile,
  timestamp,
  deactivatePassword,
  checkMail,
};
