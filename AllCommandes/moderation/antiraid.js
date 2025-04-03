const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "antiraid",
    description: "Active ou désactive l'anti-raid sur votre serveur.",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Sécurité",
    options: [
        {
            type: "boolean",
            name: "activer",
            description: "Activer ou désactiver l'anti-raid.",
            required: true,
            autocomplete: false,
        },
        {
            type: "channel",
            name: "logchannel",
            description: "Salon où envoyer les logs d'anti-raid.",
            required: true,
            autocomplete: false,
        }
    ],

    async run(bot, message, args) {
        const activer = args.getBoolean("activer");
        const logChannel = args.getChannel("logchannel");
        const guildId = message.guild.id;

        const dataPath = path.join(__dirname, '../../dataServeur.json');
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            data = {};
        }

        if (!data[guildId]) data[guildId] = {};
        data[guildId].antiRaid = activer;
        data[guildId].logChannel = logChannel.id;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        if (activer) {
            await message.reply(`🚨 **Anti-Raid activé !** Les logs seront envoyés dans ${logChannel}.`);
        } else {
            await message.reply("❌ **Anti-Raid désactivé !**");
        }

        bot.on('guildMemberAdd', async (member) => {
            if (!data[member.guild.id]?.antiRaid) return;

            const raidThreshold = 5;
            const timeWindow = 10 * 1000;

            if (!member.guild.raidInfo) {
                member.guild.raidInfo = { joins: [], isUnderRaid: false };
            }

            const now = Date.now();
            member.guild.raidInfo.joins.push(now);
            member.guild.raidInfo.joins = member.guild.raidInfo.joins.filter(joinTime => now - joinTime <= timeWindow);

            if (member.guild.raidInfo.joins.length > raidThreshold) {
                member.guild.raidInfo.isUnderRaid = true;

                const logChannel = member.guild.channels.cache.get(data[member.guild.id].logChannel);
                if (logChannel) {
                    logChannel.send(`🚨 **Raid détecté !** Plus de ${raidThreshold} membres ont rejoint en moins de ${timeWindow / 1000} secondes.`);
                }

                const newMembers = member.guild.members.cache.filter(m => m.joinedTimestamp >= now - timeWindow);
                newMembers.forEach(async newMember => {
                    try {
                        await newMember.kick("Protection anti-raid activée.");
                        if (logChannel) logChannel.send(`🚨 **${newMember.user.tag} a été expulsé pour suspicion de raid.**`);
                    } catch (err) {}
                });

                setTimeout(() => {
                    member.guild.raidInfo.isUnderRaid = false;
                    if (logChannel) logChannel.send(`✅ **Le raid semble terminé.** L'anti-raid est réinitialisé.`);
                }, 60 * 1000);
            }
        });
    }
};
