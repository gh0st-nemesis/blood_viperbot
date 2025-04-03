const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

module.exports = {
    name: "setchannelwelcome",
    description: "Permet de mettre en place le channel de bienvenue",
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
        const welcomeChannel = args.getChannel('channel')
        if (!welcomeChannel) return message.reply('Aucun channel choisi !')
        const guildId = message.guild.id;
        const dataPath = path.join(__dirname, '../../dataServeur.json')
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            data = {};
        }

        if (!data[guildId]) data[guildId] = {};
        data[guildId].welcomeChannel = welcomeChannel.id;
        data[guildId].welcomeEnabled = true;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        await message.reply(`Le salon de bienvenue a été défini sur ${welcomeChannel} et les messages de bienvenue sont activés.`);
    }
}