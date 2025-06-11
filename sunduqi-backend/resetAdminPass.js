const bcrypt = require('bcrypt');

const newHash = bcrypt.hashSync("admin123", 10);
console.log("New hash to save in DB:", newHash);