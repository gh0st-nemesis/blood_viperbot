const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "leaveteam",
    description: "Permet de quitter votre équipe actuelle.",
    permission: "Aucune",
    dm: false,
    category: "CTF-teams",
    options: [],
    async run(bot, message, args) {
        const guildId = message.guild.id;
        const userId = message.user.id;
        const username = message.user.username;

        const teamFile = path.join(__dirname, '../../teamdata.json');
        const pointsFile = path.join(__dirname, '../../ctfpoints.json');

        const teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
        const ctfPoints = JSON.parse(fs.readFileSync(pointsFile, 'utf-8'));

        if (!teamData[guildId]) teamData[guildId] = [];

        const userPoints = ctfPoints[guildId]?.[userId] || 0;

        const userTeam = teamData[guildId].find(
            team => team.chefId === userId || team.members.some(member => member.id === userId)
        );

        if (!userTeam) {
            return message.reply("❌ Vous n'êtes membre d'aucune équipe sur ce serveur.");
        }

        if (userTeam.chefId === userId) {
            // Gestion de l'utilisateur en tant que chef
            if (userTeam.members.length > 0) {
                const randomMember = userTeam.members[Math.floor(Math.random() * userTeam.members.length)];

                // Transfert du leadership
                userTeam.points -= userPoints; // Retirer les points de l'ancien chef
                userTeam.chefId = randomMember.id;
                userTeam.chefName = randomMember.name;

                // Mise à jour des chefpoints pour refléter le nouveau chef
                userTeam.chefpoints = randomMember.points;

                // Supprimer le membre promu de la liste des membres
                userTeam.members = userTeam.members.filter(member => member.id !== randomMember.id);

                // Sauvegarder les modifications
                fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 4));

                const embed = new Discord.EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Changement de leadership")
                    .setDescription(
                        `Vous avez quitté l'équipe **${userTeam.name}**, et le rôle de chef a été transféré à **${randomMember.name}**.`
                    )
                    .addFields(
                        { name: "Points retirés (ancien chef)", value: `-${userPoints}`, inline: true },
                        { name: "Points restants (équipe)", value: `${userTeam.points}`, inline: true },
                        { name: "Nouveau chef", value: `${randomMember.name}`, inline: true }
                    )
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            } else {
                // Supprime l'équipe si aucun membre n'est présent
                teamData[guildId] = teamData[guildId].filter(team => team.chefId !== userId);

                fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 4));

                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Équipe supprimée")
                    .setDescription(
                        `Vous avez quitté l'équipe **${userTeam.name}**, et comme aucun membre n'était présent, l'équipe a été supprimée.`
                    )
                    .addFields(
                        { name: "Points retirés", value: `-${userPoints}`, inline: true },
                        { name: "Équipe supprimée", value: `Aucune équipe restante`, inline: true }
                    )
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }
        } else {
            // Gestion de l'utilisateur en tant que membre
            userTeam.points -= userPoints;
            userTeam.members = userTeam.members.filter(member => member.id !== userId);

            fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 4));

            const embed = new Discord.EmbedBuilder()
                .setColor("Orange")
                .setTitle("Membre retiré de l'équipe")
                .setDescription(`Vous avez quitté l'équipe **${userTeam.name}**.`)
                .addFields(
                    { name: "Points retirés", value: `-${userPoints}`, inline: true },
                    { name: "Points restants", value: `${userTeam.points}`, inline: true }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    }
};
