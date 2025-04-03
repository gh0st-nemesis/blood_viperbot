const fs = require('fs')

module.exports = async bot => {
    fs.readdirSync("./AllEvents").filter(f => f.endsWith(".js")).forEach(async file => {
        let event = require(`../AllEvents/${file}`)
        bot.on(file.split(".js").join(""), event.bind(null, bot))
        console.log(`[+] - Event ${file} is loaded successfuly !`)
           
    })
}