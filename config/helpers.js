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
const utilities = require("../utils/packages");
const db = require("../database/mysql");
const sendError = (message) => {
    var error = {
        status: "ERROR",
        message,
    };
    return error;
};
const checkMail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db.dbs.Users.findOne({ where: { email: req.body.email } });
});
const timestamp = (async) => {
    return (Date.now() / 1000) | 0;
};
const sendSuccess = (message) => {
    var success = {
        status: "SUCCESS",
        message,
    };
    return success;
};
const checkPromo = (code) => __awaiter(void 0, void 0, void 0, function* () {
    let checker = yield db.Promotions.findOne({
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
});
const generateClientId = (length) => {
    var result = "";
    var characters = "123456789123456789123456789";
    var charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
const generateReftId = (length) => {
    var result = "";
    var characters = "abcdefghijklmnopqrstuvwxyz1234567891234ABCDEFGHIJKLMNOPQRSTUVWXYZ56789123456789";
    var charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
module.exports = {
    sendError,
    generateClientId,
    sendSuccess,
    generateReftId,
    checkPromo,
    timestamp,
    checkMail,
};
