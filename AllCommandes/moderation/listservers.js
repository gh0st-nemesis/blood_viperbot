const Discord = require('discord.js');

module.exports = {
    name: "listservers",
    description: "Lister tous les serveurs où le bot est présent.",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Info",
    options: [],
    async run(bot, message) {
        try {
            const guilds = bot.guilds.cache.map(guild => ({
                name: guild.name,
                id: guild.id,
                memberCount: guild.memberCount
            }));

            if (guilds.length === 0) {
                return message.reply("❌ Le bot n'est présent dans aucun serveur.");
            }

            const embed = new Discord.EmbedBuilder()
                .setColor("Blue")
                .setTitle("📋 Liste des serveurs")
                .setDescription(
                    "Voici les serveurs où je suis présent :\n\n" +
                    guilds
                        .map((guild, index) => `**${index + 1}.** ${guild.name} (ID: \`${guild.id}\`) - ${guild.memberCount} membres`)
                        .join("\n")
                )
                .setFooter({ text: `Total de serveurs : ${guilds.length}` })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erreur lors de la récupération des serveurs :", error);
            return message.reply("❌ Une erreur est survenue lors de la récupération de la liste des serveurs.");
        }
    }
};
