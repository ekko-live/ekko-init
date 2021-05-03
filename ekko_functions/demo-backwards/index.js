exports.handler = async (message) => {
  message.text = message.text.split("").reverse().join("");
  return message;
};
