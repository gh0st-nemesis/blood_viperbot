const Discord = require('discord.js');

module.exports = {
    name: "lock",
    description: "Verrouille le salon actuel pour empêcher les membres de parler",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    category: "Modération",
    
    async run(bot, message, args) {
        const channel = message.channel;
        const guild = message.guild;

        
        if (!message.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) {
            return message.reply("Tu n'as pas la permission de verrouiller ce salon.");
        }

        
        

        try {
            const isPrivate = channel.permissionOverwrites.cache.size > 1 || 
                (channel.permissionOverwrites.cache.some(overwrite => overwrite.id !== guild.id));
                if (isPrivate) {
                    
                    guild.roles.cache.forEach(role => {
                        if (!role.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                            channel.permissionOverwrites.edit(role.id, {
                                SendMessages: false
                            }).catch(err => {
                                console.error(`Erreur lors de la mise à jour des permissions du rôle ${role.name}:`, err);
                            });
                        }
                    });
                } else {
                    
                    channel.permissionOverwrites.edit(guild.id, {
                        SendMessages: false
                    });
    
                    
                    guild.roles.cache.forEach(role => {
                        if (!role.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                            channel.permissionOverwrites.edit(role.id, {
                                SendMessages: false
                            }).catch(err => {
                                console.error(`Erreur lors de la mise à jour des permissions du rôle ${role.name}:`, err);
                            });
                        }
                    });
                }

            message.reply(`Le salon ${channel.name} a été verrouillé. Les membres ne peuvent plus envoyer de messages.`);
        } catch (error) {
            console.error("Erreur lors du verrouillage du salon :", error);
            message.reply("Une erreur s'est produite en verrouillant le salon.");
        }
    }
};
