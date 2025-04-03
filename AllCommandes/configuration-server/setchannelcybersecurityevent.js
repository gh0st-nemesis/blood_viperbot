const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

module.exports = {
    name: "setchannelcybersecurityevent",
    description: "Permet de mettre en place le channel sur les évenements cyber !",
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
        const cyber = args.getChannel('channel')
        if (!cyber) return message.reply('Aucun channel choisi !')
        const guildId = message.guild.id;
        const dataPath = path.join(__dirname, '../../dataServeur.json')
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            data = {};
        }

        if (!data[guildId]) data[guildId] = {};
        data[guildId].cyber = cyber.id;
        data[guildId].cyberenable = true;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        await message.reply(`Le salon d'événements cyber a été défini sur ${cyber} et les messages sont activés.`);
    }
}