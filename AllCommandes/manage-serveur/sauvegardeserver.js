const fs = require('fs');
const path = require('path');
const Discord = require("discord.js");


module.exports = {
    name: "sauvegardeserver",
    description: "permet de sauvegarder votre serveur et le recréer à partir d'une clé donnée !",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Sauvegarde",


    async run(bot, message, args) {

        try {
            const cancelButton = new Discord.ButtonBuilder()
                .setLabel('Non')
                .setStyle(Discord.ButtonStyle.Danger)
                .setEmoji("❎")
                .setCustomId('cancelbutton');
            const nonbutton = new Discord.ButtonBuilder()
                .setLabel('Oui')
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji("🕵️")
                .setCustomId('choosemodel');

            const buttonRow = new Discord.ActionRowBuilder().addComponents(cancelButton, nonbutton);

            const embed = new Discord.EmbedBuilder()
                .setColor("Random")
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                .setTitle(`Sauvegarde du serveur ${message.guild.name} !`)
                .setDescription("Merci d'avoir choisi Structura Manager ! Souhaitez vous sauvegarder votre serveur ?")
                .setFields({ name: "Comment se passe la sauvegarde ?", value: "Votre sauvegarde vous permettra de récuperer votre serveur en cas de raid et etc. Une clé vous sera donner en mp ou en éphémère selon vos disponibilité en mp, ne le perdez pas cela vous permet d'utiliser votre sauvegarde !" })
                .setTimestamp()
                .setImage("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDM1enIwa2owODE4eHAydTV1eHI5MTY2dWhuYjNkams5MmZmbTVsMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zbsMLe0hKqS2nNJ7LT/giphy.gif");

            await message.reply({ embeds: [embed], components: [buttonRow] });

            const filter = (i) => i.user.id === message.user.id;
            const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'choosemodel') {
                    const embed = new Discord.EmbedBuilder()
                        .setColor("Random")
                        .setAuthor({ name: bot.user.tag, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                        .setTitle("Sauvegarde terminé ✅")
                        .setDescription("La sauvegarde est terminé avec succès !")
                        .setTimestamp()
                        .setImage("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDM1enIwa2owODE4eHAydTV1eHI5MTY2dWhuYjNkams5MmZmbTVsMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zbsMLe0hKqS2nNJ7LT/giphy.gif");

                    await interaction.update({ embeds: [embed], components: [] });

                    const secureKeysDir = path.join(__dirname, '..', 'securekeys');
                    const keysFilePath = path.join(secureKeysDir, 'keys.json');
                    if (!fs.existsSync(secureKeysDir)) {
                        fs.mkdirSync(secureKeysDir);
                    }
                    if (!fs.existsSync(keysFilePath)) {
                        fs.writeFileSync(keysFilePath, JSON.stringify({}, null, 2));
                    }
                    const keysData = JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));
                    const key = generateKey();
                    keysData[key] = { guildId: message.guild.id, date: new Date().toISOString() };
                    fs.writeFileSync(keysFilePath, JSON.stringify(keysData, null, 2));
                    const serverData = {
                        name: message.guild.name,
                        roles: message.guild.roles.cache.map(role => ({
                            name: role.name,
                            color: role.color,
                            permissions: role.permissions.bitfield.toString(),
                            position: role.position,
                        })),
                        channels: message.guild.channels.cache.filter(channel => channel.type !== Discord.ChannelType.GuildCategory).map(channel => ({
                            name: channel.name,
                            type: channel.type,
                            position: channel.rawPosition,
                            parent: channel.parent ? channel.parent.name : null,
                        })),
                        categoryChannels: message.guild.channels.cache.filter(channel => channel.type === Discord.ChannelType.GuildCategory).map(channel => ({
                            name: channel.name,
                            position: channel.rawPosition,
                        })),
                        
                        
                    };
                    const backupFilePath = path.join(__dirname, '..', 'backups', `${message.guild.id}-backup.json`);
                    if (!fs.existsSync(path.join(__dirname,  '..', 'backups'))) {
                        fs.mkdirSync(path.join(__dirname , '..', 'backups'));
                    }
                    fs.writeFileSync(backupFilePath, JSON.stringify(serverData, null, 2));
                    try {
                        await message.user.send(`Voici votre clé de sauvegarde : \`${key}\`. Conservez-la précieusement !`);
                    } catch (error) {
                        await interaction.followUp({ content: `Voici votre clé de sauvegarde : \`${key}\`. Conservez-la précieusement !`, ephemeral: true });
                    }

                } else if (interaction.customId === "cancelbutton") {
                    const embed = new Discord.EmbedBuilder()
                        .setColor("Random")
                        .setAuthor({ name: bot.user.tag, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
                        .setTitle("Sauvegarde annulé !")
                        .setDescription("Vous avez annulé la sauvegarde du serveur !")
                        .setTimestamp()
                        .setImage("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmNuNmM0NXhneDAybW54OHZiZndkNTF6NHNmamJrcGlyNWg1MzV0aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/chVgEkHr9oYz4ZPGeU/giphy.gif");
                    await interaction.update({ embeds: [embed], components: [] });


                }
            });
        } catch (error) {
            console.error(error);
            return message.reply("Une erreur est survenue !");
        }
    }
};


function generateKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
