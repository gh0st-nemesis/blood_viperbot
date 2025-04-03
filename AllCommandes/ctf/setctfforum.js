const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "setctfforum",
    description: "Configurer un salon forum pour les CTF et créer un poste de règlement.",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: false,
    category: "CTF",
    options: [
        {
            type: "channel",
            name: "salon",
            description: "Salon à configurer comme forum pour les CTF.",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "titre",
            description: "Titre du poste de règlement.",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "description",
            description: "Description du poste de règlement.",
            required: true,
            autocomplete: false,
        }
    ],

    async run(bot, message, args) {
        const salon = args.getChannel("salon");
        const titre = args.getString("titre");
        const description = args.getString("description");

        if (salon.type !== Discord.ChannelType.GuildForum) {
            return message.reply("❌ Ce salon n'est pas un salon forum. Veuillez choisir un salon forum.");
        }

        const dataPath = path.join(__dirname, '../../dataServeur.json');
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            data = {};
        }

        const guildId = message.guild.id;
        if (!data[guildId]) {
            data[guildId] = {
                serverName: message.guild.name,
                memberCount: message.guild.memberCount,
                joinedAt: message.guild.joinedAt?.toISOString() || null
            };
        }

        
        data[guildId].ctfForum = {
            id: salon.id,
            type: salon.type,
            name: salon.name
        };

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        try {
            
            const thread = await salon.threads.create({
                name: titre,
                message: {
                    content: description
                }
            });

            return message.reply(`✅ Le salon forum pour les CTF a été configuré avec succès, et un poste de règlement a été créé : ${thread.url}`);
        } catch (error) {
            console.error(error);
            return message.reply("❌ Une erreur s'est produite lors de la configuration ou de la création du poste de règlement.");
        }
    }
};
