const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "testmemberremove",
    description: "Simule l'événement d'un membre quittant le serveur",
    permission: Discord.PermissionFlagsBits.ManageGuild,
    dm: false,
    category: "Test",

    async run(bot, message, args) {
        if (!message.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            return message.reply("Vous n'avez pas la permission de tester cela.");
        }

        const member = message.guild.members.cache.get(message.user.id);

        if (!member) {
            return message.reply("Membre non trouvé dans ce serveur.");
        }

        await simulateMemberJoin(bot, member);

        message.reply(`Simulation de l'arrivée de ${member.user.tag} effectuée !`);
    }
};

async function simulateMemberJoin(bot, member) {
    const dataPath = path.join(__dirname, '../../dataServeur.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier dataServeur.json :", error);
        data = {};
    }

    const guildId = member.guild.id;

    if (!data[guildId] || !data[guildId].goodbyeChannel) {
        console.log("Aucun salon de bienvenue défini pour ce serveur.");
        return;
    }

    const goodbyeChannelId = data[guildId].goodbyeChannel;
    const goodbyeChannel = member.guild.channels.cache.get(goodbyeChannelId);

    if (!goodbyeChannel) {
        console.log("Le salon de bienvenue défini n'existe plus.");
        return;
    }

    const leaveEmbedData = data[guildId].goodbyembed || {};

    const embed = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(leaveEmbedData.title || "Au revoir !")
        .setDescription(
            (leaveEmbedData.description || `Désolé de te voir partir, ${member}. Nous espérons te revoir un jour sur ${member.guild.name}.`) +
            `\nNous te souhaitons bonne chance pour la suite !`
        )
        .setThumbnail(leaveEmbedData.thumbnail || member.user.displayAvatarURL())
        .setImage(leaveEmbedData.image || member.guild.iconURL())
        .setFooter({ text: leaveEmbedData.footer || "À bientôt !" })
        .setTimestamp();

    try {
        await goodbyeChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message de bienvenue :", error);
    }
}
