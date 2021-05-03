exports.handler = async (message) => {
  message.text = message.text.toUpperCase();
  return message;
};
