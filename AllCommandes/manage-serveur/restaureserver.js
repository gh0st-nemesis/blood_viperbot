const fs = require('fs');
const path = require('path');
const Discord = require("discord.js");

module.exports = {
    name: "restaureserver",
    description: "Permet de restaurer votre serveur à partir d'une clé de sauvegarde.",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Sauvegarde",
    options: [
        {
            type: "string",
            name: "cle",
            description: "La clé de sauvegarde qui vous a été attribuée !",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const key = args.getString("cle");
        if (!key) {
            return message.reply("Veuillez fournir une clé de sauvegarde !");
        }

        const keysFilePath = path.join(__dirname, '..', 'securekeys', 'keys.json');
        if (!fs.existsSync(keysFilePath)) {
            return message.reply("Aucune sauvegarde trouvée !");
        }

        const keysData = JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));

        if (!keysData[key]) {
            return message.reply("Clé de sauvegarde invalide ou inexistante !");
        }

        const serverDataPath = path.join(__dirname, '..', 'backups', `${keysData[key].guildId}-backup.json`);

        if (!fs.existsSync(serverDataPath)) {
            return message.reply("Aucune sauvegarde trouvée pour cette clé !");
        }

        const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf8'));
        await deleteExistingCategoriesAndChannels(message.guild)

        try {
            const guild = message.guild;
            await restaure(guild, serverData)



        } catch (error) {
            console.error(error);
            return message.reply("Une erreur est survenue lors de la restauration du serveur !");
        }
    }
};

async function restaure(guild, serverData) {
    try {

        // Créer les catégories de canaux
        const categoryChannelsMap = {};
        for (const categoryData of serverData.categoryChannels) {
            const category = await guild.channels.create({
                name: categoryData.name,
                type: Discord.ChannelType.GuildCategory,
                position: categoryData.position,
            });
            categoryChannelsMap[categoryData.name] = category.id;
        }

        // Créer les canaux et les assigner aux catégories
        for (const channelData of serverData.channels) {
            const channelOptions = {
                name: channelData.name,
                type: channelData.type,
                position: channelData.position,
                parent: categoryChannelsMap[channelData.parent] || null
            };
            await guild.channels.create(channelOptions);
        }

    } catch (error) {

    }
}
async function deleteExistingCategoriesAndChannels(guild) {
    const channels = await guild.channels.fetch();
    for (const [id, channel] of channels) {
        await channel.delete();
    }
}