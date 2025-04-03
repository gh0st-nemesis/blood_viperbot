const { DateTime } = require('luxon');
const Discord = require('discord.js');
const fs = require('fs');

const filePath = './data/events.json';

module.exports = async bot => {
    const loadEvents = () => {
        if (!fs.existsSync(filePath)) return {};
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Erreur de lecture du fichier events.json : ${error.message}`);
            return {};
        }
    };

    const now = DateTime.now().setZone('Europe/Paris');

    const allEvents = loadEvents();
    for (const [guildId, events] of Object.entries(allEvents)) {
        for (const event of events) {
            const startTime = DateTime.fromISO(event.startTime, { zone: 'Europe/Paris' });
            const remainingTime = startTime.diff(now).milliseconds;

            if (remainingTime > 0) {
                setTimeout(async () => {
                    try {
                        const guild = bot.guilds.cache.get(guildId);
                        if (!guild) {
                            console.log(`❌ Serveur non trouvé : ${guildId}`);
                            return;
                        }

                        const manager = await guild.members.fetch(event.managerId).catch(() => null);
                        const category = event.categoryId ? guild.channels.cache.get(event.categoryId) : null;

                        // Création du salon de conférence
                        const stageChannel = await guild.channels.create({
                            name: `Conférence - ${event.title}`,
                            type: Discord.ChannelType.GuildStageVoice,
                            parent: category || undefined,
                            reason: `Conférence générée automatiquement pour ${event.title}`,
                        });

                        // Création de l'instance Stage
                        await stageChannel.createStageInstance({
                            topic: event.title,
                            privacyLevel: Discord.StageInstancePrivacyLevel.GuildOnly,
                        });

                        // Permissions pour le manager
                        if (manager) {
                            await stageChannel.permissionOverwrites.edit(manager, {
                                Speak: true,
                                Connect: true,
                            });
                        }

                        console.log(`✅ Conférence créée : ${event.title}`);
                    } catch (error) {
                        console.error(`❌ Erreur lors de la création de la conférence : ${error.message}`);
                    }
                }, remainingTime);

                console.log(`✅ Restauration programmée pour l'événement : ${event.title}`);
            } else {
                console.log(`❌ Événement "${event.title}" expiré. Il ne sera pas restauré.`);
            }
        }
    }
};
