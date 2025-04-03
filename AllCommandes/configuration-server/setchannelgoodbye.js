const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

module.exports = {
    name: "setchannelgoodbye",
    description: "Permet de mettre en place le channel d'au revoir !",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: true,
    category: "Configuration-serveur",
    options: [
        {
            type: "channel",
            name: "channel",
            description: "Le salon pour le message de bienvenue !",
            required: true,
            autocomplete: false
        }
    ],
    async run(bot, message, args) {
        const goodbye = args.getChannel('channel')
        if (!goodbye) return message.reply('Aucun channel choisi !')
        const guildId = message.guild.id;
        const dataPath = path.join(__dirname, '../../dataServeur.json')
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            data = {};
        }

        if (!data[guildId]) data[guildId] = {};
        data[guildId].goodbyeChannel = goodbye.id;
        data[guildId].goodbyeEnable = true;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        await message.reply(`Le salon d'au revoir a été défini sur ${goodbye} et les messages de départ sont activés.`);
    }
}