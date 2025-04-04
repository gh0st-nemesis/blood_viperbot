const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "testmemberjoin",
    description: "Simule l'événement d'un membre rejoignant le serveur",
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

    if (!data[guildId] || !data[guildId].welcomeChannel) {
        console.log("Aucun salon de bienvenue défini pour ce serveur.");
        return;
    }

    const welcomeChannelId = data[guildId].welcomeChannel;
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

    if (!welcomeChannel) {
        console.log("Le salon de bienvenue défini n'existe plus.");
        return;
    }

    const welcomeEmbedData = data[guildId].welcomeEmbed || {};
   

    const embed = new Discord.EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(welcomeEmbedData.title || "Bienvenue !")
        .setDescription(
            (welcomeEmbedData.description || `Bienvenue à ${member} sur le serveur ${member.guild.name} !` +
            `\nNous sommes ravis de t'accueillir parmi nous !`)
        )
        .setThumbnail(welcomeEmbedData.thumbnail || member.user.displayAvatarURL())
        .setImage(welcomeEmbedData.image || member.guild.iconURL())
        .setFooter({ text: welcomeEmbedData.footer || "Profitez de votre séjour !" })
        .setTimestamp();

    try {
        await welcomeChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message de bienvenue :", error);
    }
}
