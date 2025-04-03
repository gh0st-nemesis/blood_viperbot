const Discord = require("discord.js");

module.exports = {
    name: "clear",
    description: "Efface des messages dans un salon",
    permission: Discord.PermissionFlagsBits.ManageMessages,
    dm: false,
    category: "Modération",
    options: [
        {
            type: "number",
            name: "nombre",
            description: "Le nombre de messages à supprimer !",
            required: true,
            autocomplete: false
        },
        {
            type: "channel",
            name: "salon",
            description: "Le salon où effacer les messages !",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        let channel = args.getChannel("salon") || message.channel;
        if (!channel || (channel.id !== message.channel.id && !message.guild.channels.cache.has(channel.id))) {
            return message.reply("Aucun salon trouvé !");
        }

        let number = args.getNumber("nombre");
        if (!Number.isInteger(number) || number <= 0 || number > 100) {
            return message.reply("Il faut un nombre entre `1` et `100` inclus !");
        }

        await message.deferReply({ ephemeral: true });

        try {
            const messages = await channel.bulkDelete(number, true);
            await message.followUp({ content: `J'ai effacé \`${messages.size}\` message(s) dans le salon ${channel} !`, ephemeral: true });
        } catch (error) {
            console.error("Erreur lors de la suppression des messages :", error);
            const messages = [...(await channel.messages.fetch()).filter(m => !m.interaction && (Date.now() - m.createdAt) <= 1209600000).values()];
            if (messages.length === 0) {
                return message.followUp("Impossible d'effacer les messages datant de plus de 14 jours.");
            }
            await channel.bulkDelete(messages);
            await message.followUp({ content: `J'ai pu effacer uniquement \`${messages.length}\` message(s) dans le salon ${channel}, les autres datent de plus de 14 jours !`, ephemeral: true });
        }
    }
};
