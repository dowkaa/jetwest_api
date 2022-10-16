const request = require("request");

const send = async function (mobile: number, message: string) {
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
  request(options, function (error: any, response: any) {
    if (error) throw new Error(error);
    console.log(response.body);
    return response.body;
  });
};

module.exports = {
  send,
};
