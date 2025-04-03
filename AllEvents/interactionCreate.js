const Discord = require('discord.js')
const fs = require('fs')

module.exports = async (bot, interaction) => {

    if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {
        let entry = interaction.options.getFocused()

        if (interaction.commandName === "help") {
            let choices = bot.commands.filter(cmd => cmd.name.includes(entry))
            await interaction.respond(entry === "" ? bot.commands.map(cmd => ({ name: cmd.name, value: cmd.name })) : choices.map(choice => ({ name: choice.name, value: choice.name })))
        }

        if (interaction.commandName === "addctf") {
            const focusedOption = interaction.options.getFocused(true);
            const guild = interaction.guild;
            const entry = focusedOption.value;

            const choices = [
                { name: "easy 5 pts", value: "easy" },
                { name: "medium 10 pts", value: "medium" },
                { name: "hard 20 pts", value: "hard" },
                { name: "insane 50 pts", value: "insane" },
            ]
            const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(entry.toLowerCase()));
            await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.value })));
        }

        if (interaction.commandName === "matchmaking") {
            const focusedOption = interaction.options.getFocused(true);
            const guild = interaction.guild;
            const entry = focusedOption.value;

            if (focusedOption.name === "catégorie") {

                const categories = guild.channels.cache
                    .filter(c => c.type === Discord.ChannelType.GuildCategory)
                    .map(c => ({ name: c.name, value: c.name }));

                const filtered = categories.filter(c => c.name.toLowerCase().startsWith(entry.toLowerCase()));
                await interaction.respond(
                    entry === ""
                        ? categories.map(c => ({ name: c.name, value: c.name }))
                        : filtered.map(c => ({ name: c.name, value: c.name }))
                );
            }

        }
        if (interaction.commandName === "base64"){
            const focusedOption = interaction.options.getFocused(true);
            const guild = interaction.guild;
            const entry = focusedOption.value;

            if (focusedOption.name === "text") {
                const choices = [
                    { name: "encode", value: "encode" },
                    { name: "decode", value: "decode" }
                ];
                const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(entry.toLowerCase()));
                await interaction.respond(
                    entry === ""
                        ? choices.map(choice => ({ name: choice.name, value: choice.value }))
                        : filtered.map(choice => ({ name: choice.name, value: choice.value }))
                )
            }
        }
        if (interaction.commandName === "createvoc") {
            const focusedOption = interaction.options.getFocused(true);
            const guild = interaction.guild;
            const entry = focusedOption.value;

            if (focusedOption.name === "category") {

                const categories = guild.channels.cache
                    .filter(c => c.type === Discord.ChannelType.GuildCategory)
                    .map(c => ({ name: c.name, value: c.name }));

                const filtered = categories.filter(c => c.name.toLowerCase().startsWith(entry.toLowerCase()));
                await interaction.respond(
                    entry === ""
                        ? categories.map(c => ({ name: c.name, value: c.name }))
                        : filtered.map(c => ({ name: c.name, value: c.name }))
                );
            }

        }
        if (interaction.commandName === "teamleaderboard") {
            const focusedOption = interaction.options.getFocused(true);
            const guildId = interaction.guild;
            const entry = focusedOption.value;
            let teamData;
            try {
                teamData = JSON.parse(fs.readFileSync('./teamdata.json', 'utf8'));
            } catch (error) {
                console.log("Erreur lors de la lecture de teamdata.json:", error);
                return interaction.reply({ content: "Erreur lors de la lecture des données des équipes.", ephemeral: true });
            }
            const teams = teamData[guildId] || [];
            const filteredTeams = teams.filter(team => team.name.toLowerCase().startsWith(entry.toLowerCase()));
            await interaction.respond(
                filteredTeams.map(team => ({
                    name: team.name,   // Nom à afficher dans la suggestion
                    value: team.name,    // L'ID de l'équipe comme valeur retournée
                }))
            );
        }

    }

    if (interaction.type === Discord.InteractionType.ApplicationCommand) {
        fs.readdirSync("./AllCommandes").forEach(async dir => {
            const files = fs.readdirSync(`./AllCommandes/${dir}`).filter(f => f.endsWith(".js"))
            for (const file of files) {
                let command = require(`../AllCommandes/${dir}/${file}`)
                if (command.name == interaction.commandName) {
                    let commande = require(`../AllCommandes/${dir}/${interaction.commandName}`)
                    commande.run(bot, interaction, interaction.options)
                }

            }
        })


    }
    const colorMap = {
        easy: "Green",
        medium: "Yellow",
        hard: "Red",
        insane: "Purple"
    };
    if (interaction.isButton() || interaction.isModalSubmit()) {
        const parts = interaction.customId.split('_'); // Divise par '_'
        const ctfID = parts[parts.length - 1]; // Prend la dernière partie
        const action = parts.slice(0, -1).join('_'); // Récupère le reste comme action
    
        if (action === 'validate_flag') {
            // Afficher la modale
            const modal = new Discord.ModalBuilder()
                .setCustomId(`flag_submission_${ctfID}`)
                .setTitle('Soumettre un Flag')
                .addComponents(
                    new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId('flag_input')
                            .setLabel('Entrez votre flag')
                            .setStyle(Discord.TextInputStyle.Short)
                            .setRequired(true)
                    )
                );
    
            await interaction.showModal(modal);
        } else if (action === 'flag_submission') {
            // Gestion de la soumission
            const userFlag = interaction.fields.getTextInputValue('flag_input');
    
            // Charger les données
            const ctfDataPath = './ctfData.json';
            const ctfPointsPath = './ctfpoints.json';
            const teamDataPath = './teamdata.json';
            let ctfData, ctfPointsData, teamData;
    
            try {
                ctfData = JSON.parse(fs.readFileSync(ctfDataPath, 'utf8'));
                ctfPointsData = JSON.parse(fs.readFileSync(ctfPointsPath, 'utf8'));
                teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));
            } catch (error) {
                console.error('Erreur lors de la lecture des fichiers de données', error);
            }
    
            const guildId = interaction.guild.id;
            const ctf = ctfData[guildId]?.find(c => c.titre === ctfID);
    
            if (!ctf) {
                return interaction.reply({
                    content: `❌ CTF introuvable.`,
                    ephemeral: true
                });
            }
    
            if (ctf.flag === userFlag) {
                const userId = interaction.user.id;
                if (!ctfPointsData[guildId]) ctfPointsData[guildId] = {};
                if (!ctfPointsData[guildId][userId]) ctfPointsData[guildId][userId] = 0;
    
                if (!ctf.solvedBy.includes(interaction.user.tag)) {
                    ctf.solvedBy.push(interaction.user.tag);
    
                    if (!ctf.firstBlood) ctf.firstBlood = interaction.user.tag;
                    ctf.lastBlood = interaction.user.tag;
    
                    // Ajoute les points à l'utilisateur
                    ctfPointsData[guildId][userId] += ctf.points;
    
                    // Mettre à jour les points de l'équipe
                    const team = teamData[guildId]?.find(t => 
                        t.chefId === userId || t.members.some(member => member.id === userId)
                    );
    
                    if (team) {
                        if (team.chefId === userId) {
                            // Si l'utilisateur est le chef
                            team.chefpoints += ctf.points;
                            team.points += ctf.points;
                        } else {
                            // Si l'utilisateur est un membre
                            const member = team.members.find(member => member.id === userId);
                            if (member) {
                                member.points += ctf.points;
                                team.points += ctf.points;
                            }
                        }
                    }
    
                    // Sauvegarde les modifications
                    fs.writeFileSync(teamDataPath, JSON.stringify(teamData, null, 2), 'utf8');
                    fs.writeFileSync(ctfPointsPath, JSON.stringify(ctfPointsData, null, 2), 'utf8');
                    fs.writeFileSync(ctfDataPath, JSON.stringify(ctfData, null, 2), 'utf8');
    
                    await interaction.reply({
                        content: `✅ Flag correct ! Vous avez gagné ${ctf.points} points.`,
                        ephemeral: true
                    });
    
                    try {
                        // Récupérer le canal et le message en utilisant l'ID
                        const channel = await interaction.guild.channels.fetch(ctf.channelId);
                        const sentMessage = await channel.messages.fetch(ctf.messageId);
    
                        // Création de l'embed mis à jour
                        const updatedEmbed = new Discord.EmbedBuilder()
                            .setTitle(ctf.titre)
                            .setDescription(ctf.description)
                            .setThumbnail(interaction.client.user.displayAvatarURL())
                            .setImage(interaction.client.user.displayAvatarURL())
                            .addFields(
                                { name: "🎚️Niveau", value: ctf.niveau, inline: true },
                                { name: "📃Points", value: `${ctf.points}`, inline: true },
                                { name: "🩸First Blood", value: ctf.firstBlood || "Aucun", inline: true },
                                { name: "🚩Last Blood", value: ctf.lastBlood || "Aucun", inline: true }
                            )
                            .setColor(colorMap[ctf.niveau] || "Grey")
                            .setTimestamp();
    
                        // Mise à jour de l'embed dans le message
                        await sentMessage.edit({ embeds: [updatedEmbed] });
                    } catch (error) {
                        console.error('Erreur lors de la mise à jour du message:', error);
                    }
                } else {
                    await interaction.reply({
                        content: `⚠️ Vous avez déjà résolu ce CTF.`,
                        ephemeral: true
                    });
                }
            } else {
                await interaction.reply({
                    content: `❌ Flag incorrect. Essayez encore.`,
                    ephemeral: true
                });
            }
        }
    }
    
    
}