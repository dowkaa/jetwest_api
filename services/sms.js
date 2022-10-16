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
const request = require("request");
const send = function (mobile, message) {
    return __awaiter(this, void 0, void 0, function* () {
        var url = "https://termii.com/sapp/sms/api";
        var sender = "N-Alert"; // or OTPAlert , N-Alert
        var live_key = "tsk_rty9634b0ff96706c14713t35w";
        var data = {
            action: "send-sms",
            api_key: live_key,
            to: mobile,
            from: sender,
            sms: message,
            route_id: 117,
        };
        var options = {
            method: "POST",
            url: url,
            headers: {
                "Content-Type": ["application/json"],
            },
            body: JSON.stringify(data),
        };
        request(options, function (error, response) {
            if (error)
                throw new Error(error);
            console.log(response.body);
            return response.body;
        });
    });
};
module.exports = {
    send,
};
