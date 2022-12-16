const request = require("request");
const axios = require("axios");

const send = async function (mobile: number, message: string) {
  // var url = "https://termii.com/sapp/sms/api";
  // var sender = "N-Alert"; // or OTPAlert , N-Alert
  // var live_key = "tsk_rty9634b0ff96706c14713t35w";

  // var data = {
  //   action: "send-sms",
  //   api_key: live_key,
  //   to: mobile,
  //   from: sender,
  //   sms: message,
  //   route_id: 117,
  // };

  // var options = {
  //   method: "POST",
  //   url: url,
  //   headers: {
  //     "Content-Type": ["application/json"],
  //   },
  //   body: JSON.stringify(data),
  // };
  // request(options, function (error: any, response: any) {
  //   if (error) throw new Error(error);
  //   console.log(response.body);
  //   return response.body;
  // });

  var data = JSON.stringify({
    action: "send-sms",
    api_key: "TLPEU1URoQd0tDSkQd8sJc0Pn1QybtBbnaOnjg0s99XpPkxQUKoqp1UEegy8Ym",
    to: mobile,
    from: "Dowkaa",
    type: "plain",
    channel: "generic",
    sms: message,
  });

  var config = {
    method: "post",
    url: "https://api.ng.termii.com/api/sms/send",
    headers: {
      "Content-Type": "application/json",
      Cookie: "termii-sms=SGC9p8KYgaQ7q4Tg3o4ctVNvnsxxWs5CKmCsFLPK",
    },
    data: data,
  };

  return axios(config);
};

module.exports = {
  send,
};
