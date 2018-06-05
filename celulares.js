const fs = require('fs');

let contents = fs.readFileSync("dataModeloNovo.json");
let celulares = JSON.parse(contents);

module.exports = celulares;