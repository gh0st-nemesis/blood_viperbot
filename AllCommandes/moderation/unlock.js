const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "unlock",
    description: "Déverrouille le salon actuel pour permettre aux membres de parler",
    permission: PermissionsBitField.Flags.ManageChannels,
    category: "Modération",

    async run(bot, message, args) {
        const channel = message.channel;
        const guild = message.guild;

        
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply("Tu n'as pas la permission de déverrouiller ce salon.");
        }

        try {
            
            const isPrivate = channel.permissionOverwrites.cache.size > 1 || 
                (channel.permissionOverwrites.cache.some(overwrite => overwrite.id !== guild.id));

            
            if (isPrivate) {
                
                guild.roles.cache.forEach(role => {
                    if (!role.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        channel.permissionOverwrites.edit(role.id, {
                            SendMessages: true
                        }).catch(err => {
                            console.error(`Erreur lors de la mise à jour des permissions du rôle ${role.name}:`, err);
                        });
                    }
                });
            } else {
               
                channel.permissionOverwrites.edit(guild.id, {
                    SendMessages: true
                });

                
                guild.roles.cache.forEach(role => {
                    if (!role.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        channel.permissionOverwrites.edit(role.id, {
                            SendMessages: true
                        }).catch(err => {
                            console.error(`Erreur lors de la mise à jour des permissions du rôle ${role.name}:`, err);
                        });
                    }
                });
            }

            return message.reply(`Le salon ${channel.name} est maintenant déverrouillé pour tous les membres, à l'exception des administrateurs.`);
        } catch (error) {
            console.error("Erreur lors du déverrouillage du salon :", error);
            return message.reply("Une erreur s'est produite en déverrouillant le salon.");
        }
    }
};
