const Discord = require('discord.js');

module.exports = async (bot, oldState, newState) => {
    const member = newState.member;

    if (oldState.channelId !== newState.channelId) {
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        if (newChannel && newChannel.type === Discord.ChannelType.GuildVoice) {
            const embed = new Discord.EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Un membre a rejoint un salon vocal')
                .setDescription(`${member} a rejoint le salon vocal **${newChannel.name}**.`)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: `Membre rejoint le salon ${newChannel.name}` })
                .setTimestamp();

            try {
                await newChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error("Erreur lors de l'envoi du message d'annonce d'entrée :", error);
            }
        }

        if (oldChannel && oldChannel.type === Discord.ChannelType.GuildVoice) {
            const embed = new Discord.EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Un membre a quitté un salon vocal')
                .setDescription(`${member} a quitté le salon vocal **${oldChannel.name}**.`)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: `Membre quitté le salon ${oldChannel.name}` })
                .setTimestamp();

            try {
                await oldChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error("Erreur lors de l'envoi du message d'annonce de sortie :", error);
            }
        }
    }
};
