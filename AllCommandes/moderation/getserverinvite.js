const Discord = require('discord.js');

module.exports = {
    name: "getserverinvite",
    description: "Obtenir une invitation pour un serveur spécifique.",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Info",
    options: [
        {
            type: "string",
            name: "serverid",
            description: "L'ID du serveur dont vous voulez obtenir une invitation.",
            required: true,
            autocomplete:false
        }
    ],
    async run(bot, message, args) {
        try {
            const serverId = args.getString("serverid");
            const guild = bot.guilds.cache.get(serverId);

            if (!guild) {
                return message.reply("❌ Serveur introuvable ou le bot n'y est pas présent.");
            }

            const channels = guild.channels.cache.filter(channel => 
                channel.type === Discord.ChannelType.GuildText && channel.permissionsFor(guild.members.me).has(Discord.PermissionFlagsBits.CreateInstantInvite)
            );

            if (channels.size === 0) {
                return message.reply("❌ Aucun salon approprié pour créer une invitation dans ce serveur.");
            }

            const inviteChannel = channels.first();
            const invite = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0, unique: true });

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle(`🔗 Invitation pour ${guild.name}`)
                .setDescription(`Voici une invitation pour rejoindre **${guild.name}** : [Cliquez ici pour rejoindre](${invite.url})`)
                .setFooter({ text: `ID du serveur : ${guild.id}` })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erreur lors de la création de l'invitation :", error);
            return message.reply("❌ Une erreur est survenue lors de la récupération de l'invitation.");
        }
    }
};
