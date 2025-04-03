const Discord = require('discord.js');

module.exports = {
    name: "clap",
    description: "Affiche les informations de la team C.L.A.P (Cyber Légion Anti-Pédophile)",
    category: "Informations",
    permission: "Aucune",
    dm: true,
    async run(bot, message, args) {

        const embed = new Discord.EmbedBuilder()
            .setColor('#FF5733')
            .setTitle('🌐 **Team C.L.A.P - Cyber Légion Anti-Pédophile** 🌐')
            .setDescription('La **C.L.A.P** est une organisation active dans la lutte contre la pédophilie en ligne. Leur mission est de signaler, alerter et empêcher la propagation de contenus illégaux sur internet.')
            .addFields(
                { name: "🚨 Mission", value: "Lutter contre la pédophilie sur internet, en identifiant les contenus illégaux et en alertant les autorités." },
                { name: "🔗 Réseaux sociaux", value: "[Discord](https://discord.gg/Egvthmcsxc) | [Twitter](https://x.com/CLAP_FRm) | [YouTube](https://www.youtube.com/@CLAP-FR) | [Instagram](https://www.instagram.com/c.l.a.p.fr?igsh=MWphbDMzcmdjaTBKZA%3D%3D)", inline: false },
                { name: "📡 Site web", value: "[clap-fr](https://clap-fr.vercel.app)", inline: false },
                { name: "⚖️ Partenaires", value: "Des associations et organisations légales qui aident à faire avancer la cause." },
                { name: "🐉 Dracoguard", value: "En cas de danger sur internet que vous soyez victime ou témoin, veuillez de suite le signaler sur [Dracoguard protocol](https://clap-fr.vercel.app/clap-utils/project/dracoguard)" }
            )
            .setThumbnail('https://pbs.twimg.com/profile_images/1825477757809090561/o7T7TA_l_400x400.jpg')  
            .setImage('https://pbs.twimg.com/profile_images/1825477757809090561/o7T7TA_l_400x400.jpg') 
            .setFooter({ text: 'Lutte contre la pédophilie en ligne.' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};
