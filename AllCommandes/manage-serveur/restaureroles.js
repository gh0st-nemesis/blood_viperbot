const fs = require('fs');
const path = require('path');
const Discord = require("discord.js");

module.exports = {
    name: "restaureroles",
    description: "Permet de restaurer les roles à partir d'une clé de sauvegarde.",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Sauvegarde",
    options: [
        {
            type: "string",
            name: "cle",
            description: "La clé de sauvegarde qui vous a été attribuée !",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const key = args.getString("cle");
        if (!key) {
            return message.reply("Veuillez fournir une clé de sauvegarde !");
        }

        const keysFilePath = path.join(__dirname, '..', 'securekeys', 'keys.json');
        if (!fs.existsSync(keysFilePath)) {
            return message.reply("Aucune sauvegarde trouvée !");
        }

        const keysData = JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));

        if (!keysData[key]) {
            return message.reply("Clé de sauvegarde invalide ou inexistante !");
        }

        const serverDataPath = path.join(__dirname, '..', 'backups', `${keysData[key].guildId}-backup.json`);

        if (!fs.existsSync(serverDataPath)) {
            return message.reply("Aucune sauvegarde trouvée pour cette clé !");
        }

        const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf8'));

        try {
            const guild = message.guild;
            await message.reply("Rôles restaurés avec succès !")
            await restaure(guild, serverData)
            


        } catch (error) {
            console.error(error);
            return message.reply("Une erreur est survenue lors de la restauration des roles !");
        }
    }
};

async function restaure(guild, serverData) {
    try {
        
        for (const roleData of serverData.roles) {
            await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                permissions: BigInt(roleData.permissions),
                position: roleData.position,
            });
        }
        

    } catch (error) {

    }
}
