const Discord = require('discord.js')

module.exports = {
    name: "ping",
    description: "connaître la latence du bot",
    permission: "Aucune",
    dm: true,
    category: "Informations",
    async run(bot, message, args) {
        await message.reply(`Ping Discord : \`${bot.ws.ping}\``)
    }
}