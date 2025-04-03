const Discord = require('discord.js');
const moment = require('moment');

module.exports = {
    name: "avatar",
    description: "Affiche l'avatar et des informations sur un utilisateur",
    category: "Informations",
    permission: "Aucune",
    dm: true,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "L'utilisateur dont vous voulez voir l'avatar",
            required: false
        }
    ],

    async run(bot, message, args) {
        const user = args.getUser("utilisateur") || message.user;
        const member = message.guild.members.cache.get(user.id);
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
        const createdAt = moment(user.createdAt).format('DD MMMM YYYY');
        const joinedAt = member ? moment(member.joinedAt).format('DD MMMM YYYY') : "N/A";
        
        const roles = member 
            ? member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .map(role => `<@&${role.id}>`)
                .join(', ') || 'Aucun rôle'
            : 'Membre non présent sur ce serveur';

        const embed = new Discord.EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`Informations sur ${user.username}`)
            .setThumbnail(avatarURL)
            .addFields(
                { name: "Date de création du compte", value: createdAt, inline: true },
                { name: "Date d'arrivée sur le serveur", value: joinedAt, inline: true },
                { name: "Rôles", value: roles, inline: false }
            )
            .setFooter({ text: `Demandé par ${message.user.username}`, iconURL: message.user.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};
