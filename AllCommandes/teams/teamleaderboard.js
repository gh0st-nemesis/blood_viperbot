const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "teamleaderboard",
    description: "Affiche le classement des équipes ou les détails d'une équipe spécifique.",
    permission: "Aucune",
    dm: false,
    category: "CTF-teams",
    options: [
        {
            type: "string",
            name: "nom_equipe",
            description: "Le nom de l'équipe à afficher (optionnel)",
            required: false,
            autocomplete: false
        }
    ],
    
    async run(bot, message, args) {
        const guildId = message.guild.id;
        const teamName = args.getString("nom_equipe");
        const teamFile = path.join(__dirname, '../../teamdata.json');

        if (!fs.existsSync(teamFile)) {
            return message.reply("❌ Aucun fichier d'équipe trouvé.");
        }

        const teamData = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));

        if (!teamData[guildId] || teamData[guildId].length === 0) {
            return message.reply("❌ Aucun classement disponible pour ce serveur.");
        }

        if (teamName) {
            const team = teamData[guildId].find(t => t.name.toLowerCase() === teamName.toLowerCase());

            if (!team) {
                return message.reply(`❌ L'équipe **${teamName}** n'existe pas sur ce serveur.`);
            }

            const embed = new Discord.EmbedBuilder()
                .setColor("Blue")
                .setTitle(`Détails de l'équipe : ${team.name}`)
                .addFields(
                    { name: "Chef de l'équipe", value: team.chefName, inline: true },
                    { name: "Points totaux", value: team.points.toString(), inline: true }
                )
                .addFields(
                    { name: "Membres", value: team.members.map(m => `👤 **${m.name}** | Points : ${m.points}`).join('\n') || "Aucun membre." }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } else {
            const leaderboard = teamData[guildId]
                .sort((a, b) => b.points - a.points) // Trie les équipes par points
                .map((team, index) => `${index + 1}. **${team.name}** - ${team.points} points (Chef : ${team.chefName})`)
                .join('\n');

            const embed = new Discord.EmbedBuilder()
                .setColor("Gold")
                .setTitle("Classement des équipes")
                .setDescription(leaderboard || "Aucune équipe enregistrée.")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    }
};
