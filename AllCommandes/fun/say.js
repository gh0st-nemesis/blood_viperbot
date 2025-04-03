const Discord = require('discord.js')

module.exports = {
    name: "say",
    description: "Le bot envoie ce que vous dites !",
    permission: "Aucune",
    dm: true,
    category: "Fun",
    options: [
        {
            type:"string",
            name: "say",
            description: "Le message à répéter !",
            required: true,
            autocomplete: false
        }
    ],
    async run(bot, message, args) {
        const msg = args.getString("say")
        if(!msg) return message.reply('Aucun message !')
        await message.reply(`${msg}`)
    }
}