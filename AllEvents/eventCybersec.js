const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async (bot, member) => {
    const dataPath = path.join(__dirname, '../dataServeur.json');
    let data;


    try {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier dataServeur.json :", error);
        data = {};
    }

    const guildId = member.guild.id;


    if (!data[guildId] || !data[guildId].cyber) {
        console.log("Aucun salon pour la cyber défini pour ce serveur.");
        return;
    }

    const cyberChannelId = data[guildId].cyber;
    const cyberChannel = member.guild.channels.cache.get(cyberChannelId);

    if (!cyberChannel) {
        console.log("Le salon de bienvenue défini n'existe plus.");
        return;
    }


    const leaveEmbedData  = data[guildId].cyberembed || {};

    const embed = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(leaveEmbedData.title || "Cyber Event !")
        .setDescription(
            (leaveEmbedData.description || ``) +
            `\n`
        )
        .setThumbnail(leaveEmbedData.thumbnail || member.user.displayAvatarURL())
        .setImage(leaveEmbedData.image || member.guild.iconURL())
        .setFooter({ text: leaveEmbedData.footer || "À bientôt !" })
        .setTimestamp();


    try {
        await cyberChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message de bienvenue :", error);
    }
};
