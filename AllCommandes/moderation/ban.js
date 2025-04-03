const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
    name: "ban",
    description: "Bannit un utilisateur avec une option de bannissement temporaire",
    permission: Discord.PermissionFlagsBits.BanMembers,
    category: "Modération",
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "L'utilisateur à bannir",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "durée",
            description: "Durée du bannissement temporaire (ex: 1d, 2h)",
            required: false,
            autocomplete: false
        },
        {
            type: "string",
            name: "raison",
            description: "Raison du bannissement",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const user = message.options.getUser("utilisateur");
        const duration = message.options.getString("durée") ? ms(message.options.getString("durée")) : null;
        const reason = message.options.getString("raison") || "Aucune raison spécifiée";

        if (!message.member.permissions.has(Discord.PermissionFlagsBits.BanMembers)) {
            return message.reply("Tu n'as pas la permission de bannir des membres.");
        }

        try {
            const member = message.guild.members.cache.get(user.id);
            if (!member) {
                return message.reply("Utilisateur introuvable dans ce serveur.");
            }

            await member.ban({ reason, days: 7 });
            await message.reply(`L'utilisateur ${user.tag} a été banni. Raison : ${reason}`);

            if (duration) {
                setTimeout(async () => {
                    await message.guild.members.unban(user.id);
                    message.channel.send(`L'utilisateur ${user.tag} a été débanni après ${message.options.getString("durée")}.`);
                }, duration);
            }
        } catch (error) {
            console.error("Erreur lors du bannissement :", error);
            message.reply("Une erreur s'est produite en bannissant cet utilisateur.");
        }
    }
};
