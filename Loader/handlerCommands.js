const fs = require('fs')

module.exports = async bot => {
    

    fs.readdirSync("./AllCommandes").forEach(async dir => {
        const files = fs.readdirSync(`./AllCommandes/${dir}`).filter(f => f.endsWith(".js"))
        for (const file of files) {
            let command = require(`../AllCommandes/${dir}/${file}`)
            if (!command.name || typeof command.name !== "string") throw new TypeError(`[-] - Command ${file.slice(0, file.length - 3)} doesn't have a name !`)
            bot.commands.set(command.name, command)
            console.log(`[+] - Commande ${dir}/${file} loaded successfuly !`)
        }
    })
}