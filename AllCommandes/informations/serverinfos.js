const Discord = require('discord.js');
const moment = require('moment');

module.exports = {
    name: "serverinfos",
    description: "Affiche les informations sur le serveur",
    category: "Informations",
    permission: "Aucune",
    dm: true,
    async run(bot, message, args) {
        const guild = message.guild;
        const owner = await guild.fetchOwner();
        
        const creationDate = moment(guild.createdAt).format('DD MMMM YYYY');
        const totalChannels = guild.channels.cache.size;
        
        const totalMembers = guild.members.cache.filter(member => !member.user.bot).size;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        
        const onlineUsers = guild.members.cache.filter(
            member => !member.user.bot && member.presence && member.presence.status !== 'offline'
        ).size;

        const boostCount = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier;

        const embed = new Discord.EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`Informations sur le serveur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setDescription(`Voici un résumé détaillé du serveur **${guild.name}**. Profitez-en !`)
            .addFields(
                { name: "🧑‍💼 Propriétaire", value: `<@${owner.id}>`, inline: true },
                { name: "📅 Date de création", value: creationDate, inline: true },
                { name: "🔧 Nombre de salons", value: `${totalChannels}`, inline: true },
                { name: "👥 Nombre d'utilisateurs", value: `${totalMembers}`, inline: true },
                { name: "🤖 Nombre de bots", value: `${botCount}`, inline: true },
                { name: "💬 Utilisateurs en ligne", value: `${onlineUsers}`, inline: true },
                { name: "🎉 Nombre de boosts", value: `${boostCount}`, inline: true },
                { name: "🔥 Niveau de boost", value: `Niveau ${boostLevel}`, inline: true }
            )
            .setFooter({ text: `ID du serveur: ${guild.id}` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};
