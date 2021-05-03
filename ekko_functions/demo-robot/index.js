exports.handler = async (message) => {
  message.text = message.text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2))
    .join("");
  return message;
};
