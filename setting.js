const chalk = require("chalk");
const fs = require("fs");

global.owner = '6288809776791'
global.thumbnail = "https://files.catbox.moe/tptfhw.jpg"
global.qris = "https://files.catbox.moe/vu5kd0.jpeg"
global.dana = "0882003061918"
global.Delay = 6000

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.white("[•] Update"), chalk.white(`${__filename}\n`))
delete require.cache[file]
require(file)
})