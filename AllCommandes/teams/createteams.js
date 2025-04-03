const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "createteams",
    description: "Permet de créer une équipe et d'en devenir le chef.",
    permission: "Aucune",
    dm: false,
    category: "CTF-teams",
    options: [
        {
            type: "string",
            name: "nom",
            description: "Le nom de l'équipe",
            required: true,
            autocomplete: false
        }
    ],
    async run(bot, message, args) {
        const teamName = args.getString("nom");
        const guildId = message.guild.id;
        const userId = message.user.id;
        const username = message.user.username;

        const pointsFile = path.join(__dirname, '../../ctfpoints.json');
        const teamFile = path.join(__dirname, '../../teamdata.json');

        const teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
        const ctfPoints = JSON.parse(fs.readFileSync(pointsFile, 'utf-8'));

        if (!teamData[guildId]) teamData[guildId] = [];

        // Vérifie si l'utilisateur est déjà dans une équipe
        const isInAnyTeam = teamData[guildId].some(
            team => team.chefId === userId || team.members.some(member => member.id === userId)
        );

        if (isInAnyTeam) {
            return message.reply("❌ Vous êtes déjà membre d'une équipe. Quittez votre équipe actuelle pour en créer une nouvelle.");
        }

        // Vérifie si l'utilisateur est déjà chef d'une équipe
        const existingTeam = teamData[guildId].find(team => team.chefId === userId);
        if (existingTeam) {
            return message.reply(`❌ Vous êtes déjà le chef de l'équipe **${existingTeam.name}**.`);
        }

        // Vérifie si une équipe existe avec le même nom
        const duplicateTeam = teamData[guildId].find(team => team.name.toLowerCase() === teamName.toLowerCase());
        if (duplicateTeam) {
            return message.reply("❌ Une équipe avec ce nom existe déjà sur ce serveur.");
        }

        // Points de l'utilisateur
        const userPoints = (ctfPoints[guildId] && ctfPoints[guildId][userId]) ? ctfPoints[guildId][userId] : 0;

        const newTeam = {
            name: teamName,
            chefId: userId,
            chefName: username,
            points: userPoints,
            chefpoints: userPoints,
            members: []
        };

        teamData[guildId].push(newTeam);

        fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 4));

        const embed = new Discord.EmbedBuilder()
            .setColor("Green")
            .setTitle("Équipe créée avec succès !")
            .setDescription(`L'équipe **${teamName}** a été créée et vous en êtes le chef.`)
            .addFields(
                { name: "Chef de l'équipe", value: username, inline: true },
                { name: "Points totaux", value: userPoints.toString(), inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
