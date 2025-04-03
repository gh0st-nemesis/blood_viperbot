


const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "createvoc",
    description: "Crée des salons vocaux dans une catégorie avec des emojis.",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: true,
    category: "Gestion-serveur",
    options: [
        {
            type: "channel",
            name: "category",
            description: "La catégorie dans laquelle les salons vocaux seront créés.",
            required: true,
            autocomplete: true
        },
        {
            type: "integer",
            name: "number_of_channels",
            description: "Nombre de salons vocaux à créer.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const category = args.getChannel('category');
        const numberOfChannels = args.getInteger('number_of_channels');
        
        
        if (!category || numberOfChannels < 1 || numberOfChannels > 100) {
            return message.reply('Veuillez fournir une catégorie valide et un nombre de salons entre 1 et 100.');
        }

        
        const emojis = [
            "🦄", "🐉", "🐳", "🦋", "🌸", "🌞", "🍀", "🌙", "🌈", "🍓",
            "🥑", "🍍", "🍎", "🍌", "🍒", "🍉", "🍊", "🍋", "🍓", "🥥",
            "🍇", "🍊", "🍆", "🍅", "🥥", "🍍", "🥝", "🥑", "🌽", "🥕",
            "🌶", "🍄", "🥨", "🥞", "🍿", "🍫", "🍩", "🍪", "🍬", "🍯",
            "🍹", "🍸", "🥂", "🍺", "🍻", "🥃", "🍷", "🍽", "🥄", "🍴",
            "🍧", "🍰", "🍪", "🍦", "🍑", "🍈", "🍒", "🍓", "🍍", "🍊",
            "🍓", "🍉", "🥥", "🍋", "🍈", "🍑", "🥭", "🍒", "🍇", "🍉",
            "🍍", "🍆", "🍊", "🍓", "🍒", "🌻", "🌸", "🌺", "🌼", "🌾",
            "🌿", "🍃", "🌱", "🌲", "🌳", "🍁", "🍂", "🍃", "🌳", "🌰",
            "🍀", "🍃", "🌴", "🌵", "🌾", "🌽", "🌾", "🍂", "🍁", "🍃",
            "🌷", "🥀", "🌸", "🌻", "🌼", "🍄", "🍃", "🌲", "🌳", "🌴"
        ];

        
        for (let i = 51; i <= numberOfChannels; i++) {
            const emoji = emojis[i % emojis.length];  
            await message.guild.channels.create({
                name: `${emoji}・Vocal ${i}`,
                type: Discord.ChannelType.GuildVoice,
                parent: category.id,
            });
        }

        
        await message.reply(`J'ai créé **${numberOfChannels}** salons vocaux dans la catégorie **${category.name}** avec des emojis uniques.`);
    }
};
