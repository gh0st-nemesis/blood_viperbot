const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "leaderboardctf",
    description: "Afficher le classement des participants aux CTFs.",
    permission: Discord.PermissionFlagsBits.SendMessages,
    dm: false,
    category: "CTF",
    options: [],

    async run(bot, message, args) {
        const ctfPointsPath = path.join(__dirname, '../../ctfpoints.json');
        let ctfPointsData;

        // Lire les données des points
        try {
            ctfPointsData = JSON.parse(fs.readFileSync(ctfPointsPath, 'utf8'));
        } catch (error) {
            ctfPointsData = {};
        }

        const guildId = message.guild.id;

        // Vérification : aucune donnée pour ce serveur
        if (!ctfPointsData[guildId] || Object.keys(ctfPointsData[guildId]).length === 0) {
            return message.reply("❌ Aucun participant trouvé pour le classement CTF !");
        }

        // Collecte des données de classement
        const leaderboard = Object.entries(ctfPointsData[guildId])
            .map(([userId, points]) => ({ userId, points }))
            .sort((a, b) => b.points - a.points) // Trier par points décroissants
            .slice(0, 10); // Limiter aux 10 meilleurs

        // Création de l'affichage
        let leaderboardDescription = "";
        for (const [index, entry] of leaderboard.entries()) {
            const user = await message.guild.members.fetch(entry.userId).catch(() => null);
            const username = user ? user.user.tag : "Utilisateur inconnu";
            leaderboardDescription += `**#${index + 1}** - ${username}: ${entry.points} points\n`;
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle("🏆 Classement des CTFs")
            .setDescription(leaderboardDescription || "Aucune participation enregistrée.")
            .setColor("Gold")
            .setTimestamp()
            .setFooter({ text: `Classement du serveur ${message.guild.name}`, iconURL: message.guild.iconURL() });

        // Envoi du classement
        await message.reply({ embeds: [embed] });
    }
};
