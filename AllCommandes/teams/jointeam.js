const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "jointeam",
    description: "Permet de rejoindre une équipe existante.",
    permission: "Aucune",
    dm: false,
    category: "CTF-teams",
    options: [],
    async run(bot, message, args) {
        const guildId = message.guild.id;
        const userId = message.user.id;
        const username = message.user.username;
        const pointsFile = path.join(__dirname, '../../ctfpoints.json');
        const teamFile = path.join(__dirname, '../../teamdata.json');
        if (!fs.existsSync(teamFile)) return message.reply("❌ Aucun fichier d'équipe trouvé.");
        if (!fs.existsSync(pointsFile)) return message.reply("❌ Aucun fichier de points trouvé.");

        const teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
        const ctfPoints = JSON.parse(fs.readFileSync(pointsFile, 'utf-8'));

        if (!teamData[guildId] || teamData[guildId].length === 0) {
            return message.reply("❌ Aucune équipe n'existe sur ce serveur.");
        }

        const currentTeam = teamData[guildId].find(team => team.members.some(member => member.id === userId) || team.chefId === userId);
        if (currentTeam) {
            return message.reply(`❌ Vous êtes déjà dans l'équipe **${currentTeam.name}**.`);
        }

        const userPoints = (ctfPoints[guildId] && ctfPoints[guildId][userId]) ? ctfPoints[guildId][userId] : 0;

        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("join_team_selector")
            .setPlaceholder("Choisissez une équipe")
            .addOptions(
                teamData[guildId].map(team => ({
                    label: team.name,
                    value: team.name,
                    description: `Chef : ${team.chefName} | Points : ${team.points}`,
                    emoji: "👥"
                }))
            );

        const actionRow = new Discord.ActionRowBuilder().addComponents(selectMenu);

        const embed = new Discord.EmbedBuilder()
            .setColor("Blue")
            .setTitle("Rejoindre une équipe")
            .setDescription("Choisissez une équipe à rejoindre dans le menu ci-dessous.")
            .setTimestamp();

        await message.reply({ embeds: [embed], components: [actionRow] });

        const collector = message.channel.createMessageComponentCollector({
            componentType: Discord.ComponentType.StringSelect,
            time: 60000
        });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== userId) {
                return interaction.reply({ content: "❌ Ce menu ne vous est pas destiné.", ephemeral: true });
            }

            const selectedTeamName = interaction.values[0];
            const selectedTeam = teamData[guildId].find(team => team.name === selectedTeamName);

            if (!selectedTeam) {
                return interaction.update({ content: "❌ L'équipe sélectionnée n'existe pas.", components: [], embeds: [] });
            }

            const chef = await message.guild.members.fetch(selectedTeam.chefId);
            const chefPing = chef.user.toString(); // Ping du chef

            // Créer une série de boutons pour que le chef valide ou refuse
            const acceptButton = new Discord.ButtonBuilder()
                .setCustomId("accept_join")
                .setLabel("Accepter")
                .setStyle(Discord.ButtonStyle.Success);
            const rejectButton = new Discord.ButtonBuilder()
                .setCustomId("reject_join")
                .setLabel("Refuser")
                .setStyle(Discord.ButtonStyle.Danger);

            const actionRowChef = new Discord.ActionRowBuilder().addComponents(acceptButton, rejectButton);

            const embedChef = new Discord.EmbedBuilder()
                .setColor("Blue")
                .setTitle("Demande de rejoindre une équipe")
                .setDescription(`${chefPing}, voulez-vous accepter **${username}** dans votre équipe **${selectedTeam.name}** ?`)
                .setTimestamp();

            // Envoi du message de notification dans le canal à l'utilisateur, lui disant qu'il attend la décision du chef
            await interaction.update({
                content: `⏳ **Attendez la décision du chef de l'équipe ${selectedTeam.name}.**`, 
                ephemeral: true
            });

            // Envoi du message à un canal privé du chef avec les boutons
            await message.channel.send({
                content: chefPing, // Cela ping le chef
                embeds: [embedChef], 
                components: [actionRowChef],
                ephemeral: true // Cela rend ce message uniquement visible pour le chef
            });

            // Attendre la réponse du chef via les boutons
            const filter = i => i.user.id === selectedTeam.chefId;  // Seulement le chef peut répondre
            const chefCollector = message.channel.createMessageComponentCollector({
                filter,
                time: 60000
            });

            chefCollector.on('collect', async (chefInteraction) => {
                if (chefInteraction.customId === "accept_join") {
                    // Ajouter le membre à l'équipe
                    selectedTeam.members.push({ id: userId, name: username, points: userPoints });
                    selectedTeam.points += userPoints;

                    fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 4));

                    const confirmEmbed = new Discord.EmbedBuilder()
                        .setColor("Green")
                        .setTitle("Équipe rejointe avec succès !")
                        .setDescription(`Vous avez rejoint l'équipe **${selectedTeam.name}**.`)
                        .addFields(
                            { name: "Chef de l'équipe", value: selectedTeam.chefName, inline: true },
                            { name: "Points totaux de l'équipe", value: selectedTeam.points.toString(), inline: true }
                        )
                        .setTimestamp();

                    await message.channel.send({ embeds: [confirmEmbed] }); // Envoi au demandeur
                    await chefInteraction.reply({ content: "✔️ Le membre a été accepté.", ephemeral: true });
                } else if (chefInteraction.customId === "reject_join") {
                    await chefInteraction.reply({ content: "❌ La demande a été refusée.", ephemeral: true });

                    const rejectEmbed = new Discord.EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Rejet de la demande")
                        .setDescription(`Désolé, **${username}**, votre demande de rejoindre l'équipe **${selectedTeam.name}** a été refusée.`)
                        .setTimestamp();

                    await message.channel.send({ embeds: [rejectEmbed] }); // Notification à l'utilisateur que la demande a été refusée

                    // Le membre peut réessayer plus tard
                    await interaction.update({ content: `❌ Votre demande d'ajout à l'équipe **${selectedTeam.name}** a été refusée. Vous pouvez retenter plus tard.`, components: [] });
                }
            });

            chefCollector.on('end', collected => {
                if (!collected.size) {
                    message.channel.send("⏰ Temps écoulé. Aucune décision n'a été prise.");
                }
            });
        });

        collector.on('end', collected => {
            if (!collected.size) {
                message.channel.send("⏰ Temps écoulé. Vous n'avez pas rejoint d'équipe.");
            }
        });
    }
};
