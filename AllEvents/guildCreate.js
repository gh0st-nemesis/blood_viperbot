const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ChannelType } = require('discord.js')

module.exports = async (bot, guild) => {

    const dataPath = path.join(__dirname, '../dataServeur.json');
    let data;


    try {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
        console.error("Erreur de lecture du fichier dataServeur.json :", error);
        data = {};
    }


    if (!data[guild.id]) {
        data[guild.id] = {
            serverName: guild.name,
            memberCount: guild.memberCount,
            joinedAt: new Date().toISOString(),
        };
    }

    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Les informations du serveur "${guild.name}" ont été enregistrées.`);
    } catch (error) {
        console.error("Erreur d'écriture dans le fichier dataServeur.json :", error);
    }

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Merci de m'avoir ajouté sur ${guild.name} !`)
        .setDescription("Je suis prêt à vous aider ! Tapez `/help` pour voir mes commandes disponibles.")
        .setThumbnail(bot.user.displayAvatarURL())
        .addFields(
            { name: 'Nombre de membres', value: `${guild.memberCount}`, inline: false },
            { name: 'Serveur créé le', value: `${guild.createdAt.toDateString()}`, inline: false }
        )
        .setImage(guild.iconURL())
        .setFooter({ text: 'Merci de m’avoir ajouté !' });

    const textChannel = guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me).has('SendMessages')
    );
    if (textChannel) {
        textChannel.send({ embeds: [embed] })
            .then(() => console.log(`Embed de bienvenue envoyé dans le salon ${textChannel.name} de ${guild.name}.`))
            .catch(error => console.error("Erreur lors de l'envoi de l'embed :", error));
    } else {
        console.log("Aucun salon textuel disponible pour envoyer l'embed de bienvenue.");
    }
};
