const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "addctf",
    description: "Ajouter un CTF dans le forum",
    permission: "Aucune",
    dm: false,
    category: "CTF",
    options: [
        {
            type: "string",
            name: "titre",
            description: "Titre du CTF.",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "description",
            description: "Description du CTF.",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "niveau",
            description: "Difficulté (easy, medium, hard, insane).",
            required: true,
            autocomplete: true
        },
        {
            type: "string",
            name: "flag",
            description: "Flag du CTF.",
            required: true,
            autocomplete: false
        },
        {
            type: "channel",
            name: "canal",
            description: "Canal où envoyer le message CTF.",
            required: true,
            autocomplete: false
        }
    ],

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const difficulties = ["easy", "medium", "hard", "insane"];
        const filtered = difficulties.filter(difficulty => difficulty.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(difficulty => ({ name: difficulty, value: difficulty }))
        );
    },

    async run(bot, message, args) {
        const titre = args.getString("titre");
        const description = args.getString("description");
        const niveau = args.getString("niveau");
        const flag = args.getString("flag");
        const canal = args.getChannel("canal");
        const guildId = message.guild.id;

        const pointsMap = {
            easy: 5,
            medium: 10,
            hard: 20,
            insane: 50
        };
        const points = pointsMap[niveau] || 0;

        const colorMap = {
            easy: "Green",
            medium: "Yellow",
            hard: "Red",
            insane: "Purple"
        };

        const serverDataPath = path.join(__dirname, '../../dataServeur.json');
        const ctfDataPath = path.join(__dirname, '../../ctfData.json');
        const ctfPointsPath = path.join(__dirname, '../../ctfpoints.json');

        let serverData, ctfData, ctfPointsData;
        try {
            serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf8'));
        } catch (error) {
            serverData = {};
        }

        try {
            ctfData = JSON.parse(fs.readFileSync(ctfDataPath, 'utf8'));
        } catch (error) {
            ctfData = {};
        }

        try {
            ctfPointsData = JSON.parse(fs.readFileSync(ctfPointsPath, 'utf8'));
        } catch (error) {
            ctfPointsData = {};
        }

        // Ajout du CTF aux données
        const ctf = {
            titre,
            description,
            niveau,
            flag,
            points,
            firstBlood: null,
            lastBlood: null,
            solvedBy: []
        };

        

        const embed = new Discord.EmbedBuilder()
            .setTitle(titre)
            .setDescription(description)
            .setThumbnail(bot.user.displayAvatarURL())
            .setImage(bot.user.displayAvatarURL())
            .addFields(
                { name: "🎚️Niveau", value: niveau, inline: true },
                { name: "📃Points", value: `${points}`, inline: true },
                { name: "🩸First Blood", value: ctf.firstBlood ? ctf.firstBlood : "Aucun", inline: true },
                { name: "🚩Last Blood", value: ctf.lastBlood ? ctf.lastBlood : "Aucun", inline: true }
            )
            .setColor(colorMap[niveau] || "Grey")
            .setTimestamp();

        try {
            // Envoi du message CTF dans le canal spécifié
            const sentMessage = await canal.send({
                embeds: [embed],
            });
            ctf.messageId = sentMessage.id; // Ajout de l'ID du message
            ctf.channelId = canal.id; // Ajout de l'ID du canal

            if (!ctfData[guildId]) ctfData[guildId] = [];
            ctfData[guildId].push(ctf);

            fs.writeFileSync(ctfDataPath, JSON.stringify(ctfData, null, 2), 'utf8');

            const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`validate_flag_${titre}`)
                        .setLabel("Valider le Flag")
                        .setStyle(Discord.ButtonStyle.Success)
                );

            // Ajout du bouton de validation du flag
            await sentMessage.edit({
                components: [row]
            });

            await message.reply(`✅ CTF ajouté avec succès dans le canal : **${canal.name}**.`);

            // Création d'un collecteur pour écouter les clics sur le bouton
            const filter = i => i.customId === `validate_flag_${titre.substring(0, 20)}` && i.user;
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 86400000 }); 

            // collector.on('collect', async interaction => {
            //     const modal = new Discord.ModalBuilder()
            //         .setCustomId(`flag_submission_${titre.substring(0, 20)}`)
            //         .setTitle(`Validation du Flag - ${titre.substring(0, 20)}`)
            //         .addComponents(
            //             new Discord.ActionRowBuilder()
            //                 .addComponents(
            //                     new Discord.TextInputBuilder()
            //                         .setCustomId('flag_input')
            //                         .setLabel("Entrez votre flag")
            //                         .setStyle(Discord.TextInputStyle.Short)
            //                         .setRequired(true)
            //                 )
            //         );

            //     await interaction.showModal(modal);
            // });

            // bot.on('interactionCreate', async interaction => {
            //     if (!interaction.isModalSubmit()) return;

            //     if (interaction.customId === `flag_submission_${titre}`) {
            //         const userFlag = interaction.fields.getTextInputValue('flag_input');
            //         const guildData = ctfData[guildId].find(c => c.titre === titre);

            //         // Vérification si le flag est correct
            //         if (guildData.flag === userFlag) {
            //             const userId = interaction.user.id;

            //             // Vérifier si l'utilisateur a déjà résolu ce CTF
            //             if (guildData.solvedBy.includes(interaction.user.tag)) {
            //                 // Si oui, informer l'utilisateur qu'il a déjà gagné
            //                 await interaction.reply({
            //                     content: `❌ Vous avez déjà résolu ce CTF. Aucun point n'a été ajouté.`,
            //                     ephemeral: true
            //                 });
            //                 return;
            //             }

            //             // Ajouter les points à l'utilisateur
            //             if (!ctfPointsData[guildId]) {
            //                 ctfPointsData[guildId] = {};
            //             }
            //             if (!ctfPointsData[guildId][userId]) {
            //                 ctfPointsData[guildId][userId] = 0;
            //             }

            //             ctfPointsData[guildId][userId] += points;

            //             fs.writeFileSync(ctfPointsPath, JSON.stringify(ctfPointsData, null, 2), 'utf8');

            //             // Mise à jour du CTF avec FirstBlood et LastBlood
            //             if (!guildData.firstBlood) {
            //                 guildData.firstBlood = interaction.user.tag;
            //             }

            //             guildData.lastBlood = interaction.user.tag;
            //             if (!guildData.solvedBy.includes(interaction.user.tag)) {
            //                 guildData.solvedBy.push(interaction.user.tag);
            //             }

            //             fs.writeFileSync(ctfDataPath, JSON.stringify(ctfData, null, 2), 'utf8');

            //             const updatedEmbed = new Discord.EmbedBuilder()
            //                 .setTitle(titre)
            //                 .setDescription(description)
            //                 .setThumbnail(bot.user.displayAvatarURL())
            //                 .setImage(bot.user.displayAvatarURL())
            //                 .addFields(
            //                     { name: "🎚️Niveau", value: niveau, inline: true },
            //                     { name: "📃Points", value: `${points}`, inline: true },
            //                     { name: "🩸First Blood", value: guildData.firstBlood, inline: true },
            //                     { name: "🚩Last Blood", value: guildData.lastBlood, inline: true }
            //                 )
            //                 .setColor(colorMap[niveau] || "Grey")
            //                 .setTimestamp();

            //             await sentMessage.edit({
            //                 embeds: [updatedEmbed]
            //             });

            //             await interaction.reply({
            //                 content: `🎉 Flag correct ! Vous avez gagné ${points} points. Total des points : ${ctfPointsData[guildId][userId]}.`,
            //                 ephemeral: true
            //             });
            //         } else {
            //             await interaction.reply({
            //                 content: `❌ Flag incorrect. Essayez à nouveau !`,
            //                 ephemeral: true
            //             });
            //         }
            //     }
            // });

        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
            message.reply("❌ Une erreur s'est produite lors de l'envoi du message dans le canal.");
        }
    }
};
