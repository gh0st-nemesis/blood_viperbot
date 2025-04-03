const Discord = require('discord.js');
const { DateTime } = require('luxon');
const fs = require('fs');

const filePath = './data/events.json';

const saveEvent = (guildId, eventData) => {
    let events = {};
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            events = JSON.parse(fileContent);
            if (typeof events !== 'object' || events === null) {
                throw new Error('Le fichier JSON doit contenir un objet.');
            }
        } catch (error) {
            console.error(`Erreur lors de la lecture/parsing du fichier JSON : ${error.message}`);
            events = {};
        }
    }

    if (!events[guildId]) {
        events[guildId] = [];
    }

    events[guildId].push(eventData);

    try {
        fs.writeFileSync(filePath, JSON.stringify(events, null, 4), 'utf8');
        console.log('Événement sauvegardé avec succès.');
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde des événements : ${error.message}`);
    }
};


module.exports = {
    name: "matchmaking",
    description: "Créer un événement matchmaking avec une conférence vocale programmée.",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: false,
    category: "Événements",
    options: [
        {
            type: "string",
            name: "titre",
            description: "Le titre de l'événement.",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "description",
            description: "La description de l'événement.",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "date",
            description: "La date de l'événement (format ISO: YYYY-MM-DDTHH:mm:ss).",
            required: true,
            autocomplete: false,
        },
        {
            type: "user",
            name: "manager",
            description: "L'utilisateur qui gérera l'événement.",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "catégorie",
            description: "La catégorie où le canal sera créé.",
            required: false,
            autocomplete: true,
        },
    ],

    async run(bot, message, args) {
        const guild = message.guild;
        const titre = args.getString("titre");
        const description = args.getString("description");
        const dateStr = args.getString("date");
        const manager = args.getUser("manager");
        const category = args.getString("categorie");

        const date = DateTime.fromISO(dateStr, { zone: 'Europe/Paris' });

        if (!date.isValid) {
            return message.reply("❌ Format de date invalide. Utilisez le format ISO : `YYYY-MM-DDTHH:mm:ss`.");
        }
        if (date <= DateTime.now().setZone('Europe/Paris')) {
            return message.reply("❌ La date doit être future.");
        }
        let categoryId = null;

        if (category) {
            const categoryIdRegex = /^<#(\d+)>$/;
            const match = category.match(categoryIdRegex);

            if (match) {
                // Si c'est une mention de catégorie, on récupère l'ID
                categoryId = match[1];
            } else {
                // Si ce n'est pas une mention de catégorie valide, on peut chercher une catégorie par son nom
                const categoryChannel = guild.channels.cache.find(c => c.name === category && c.type === Discord.ChannelType.GuildCategory);
                if (categoryChannel) {
                    categoryId = categoryChannel.id;
                }
            }
        }

        try {
            const startTime = date.toUTC().toISO();
            const endTime = date.plus({ hours: 1 }).toUTC().toISO();

            const event = await guild.scheduledEvents.create({
                name: titre,
                scheduledStartTime: startTime,
                scheduledEndTime: endTime,
                privacyLevel: Discord.GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: Discord.GuildScheduledEventEntityType.External,
                entityMetadata: { location: "Conférence vocale (automatique)" },
                description,
            });

            saveEvent(guild.id, {
                guildId: guild.id,
                eventId: event.id,
                title: titre,
                managerId: manager.id,
                description,
                startTime: date.toISO(),
                endTime: date.plus({ hours: 1 }).toISO(),
                categoryId: categoryId || null,
            });

            message.reply(`✅ Événement "${titre}" programmé avec succès.`);

            const timeUntilStart = date.toMillis() - DateTime.now().toMillis();

            setTimeout(async () => {
                try {
                    const categoryChannel = category
                        ? guild.channels.cache.get(category.id)
                        : null;

                    const stageChannel = await guild.channels.create({
                        name: `Conférence - ${titre}`,
                        type: Discord.ChannelType.GuildStageVoice,
                        parent: categoryChannel || null,
                        reason: `Création automatique pour l'événement "${titre}"`,
                    });

                    await stageChannel.createStageInstance({
                        topic: titre,
                        privacyLevel: Discord.StageInstancePrivacyLevel.GuildOnly,
                        reason: "Conférence vocale générée automatiquement.",
                    });

                    console.log(`✅ Salon de conférence créé avec succès pour l'événement "${titre}".`);

                    const guildMember = await guild.members.fetch(manager.id);
                    if (guildMember) {
                        await stageChannel.permissionOverwrites.edit(guildMember, {
                            Speak: true,
                            Connect: true,
                        });
                    }
                } catch (error) {
                    console.error(`❌ Erreur lors de la création du salon de conférence : ${error.message}`);
                }
            }, timeUntilStart);
        } catch (error) {
            console.error(`Erreur : ${error.message}`);
            message.reply("❌ Une erreur est survenue lors de la création de l'événement.");
        }
    },
};
