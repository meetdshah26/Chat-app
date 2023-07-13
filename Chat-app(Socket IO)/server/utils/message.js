const moment = require("moment");

let generateMessage = (from, text) => {
  return {
    from:from,
    text:text,
    createdAt: moment().valueOf()
  };
};

module.exports = generateMessage;