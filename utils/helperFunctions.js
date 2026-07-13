const capitalizeFirstLetter = (str) => {
  if (!str) return ""; // Handle empty strings
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
module.exports = capitalizeFirstLetter;
