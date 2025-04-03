const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "setmessagewelcome",
    description: "Permet de configurer le message de bienvenue",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: false,
    category: "Configuration-serveur",
    
    async run(bot, message, args) {
        const selectMenu = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId('welcome_embed_selector')
                    .setPlaceholder('Choisissez une partie du message de bienvenue à configurer')
                    .addOptions([
                        { label: 'Titre', value: 'title' },
                        { label: 'Description', value: 'description' },
                        { label: 'Footer', value: 'footer' },
                        { label: 'Thumbnail (URL)', value: 'thumbnail' },
                        { label: 'Image principale (URL)', value: 'image' },
                    ])
            );

        await message.reply({ content: "Sélectionnez l'élément du message de bienvenue à personnaliser :", components: [selectMenu], ephemeral: true });

        const filter = i => i.customId === 'welcome_embed_selector' && i.user.id === message.user.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            const selectedOption = interaction.values[0];
            const label = {
                title: 'Titre',
                description: 'Description',
                footer: 'Footer',
                thumbnail: 'Thumbnail (URL)',
                image: 'Image principale (URL)',
            }[selectedOption];

            const modal = new Discord.ModalBuilder()
                .setCustomId(`welcome_embed_modal_${selectedOption}`)
                .setTitle(`Configurer ${label}`)
                .addComponents(
                    new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId('embed_value')
                            .setLabel(`Nouvelle valeur pour ${label}`)
                            .setStyle(Discord.TextInputStyle.Short)
                            .setPlaceholder(`Entrez le ${label.toLowerCase()}`)
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);

          
            const modalFilter = i => i.customId === `welcome_embed_modal_${selectedOption}` && i.user.id === message.user.id;
            interaction.awaitModalSubmit({ filter: modalFilter, time: 60000 })
                .then(async modalInteraction => {
                    const guildId = message.guild.id;
                    const dataPath = path.join(__dirname, '../../dataServeur.json');
                    const newValue = modalInteraction.fields.getTextInputValue('embed_value');

                    let data;
                    try {
                        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    } catch (error) {
                        data = {};
                    }

                    if (!data[guildId]) data[guildId] = {};
                    if (!data[guildId].welcomeEmbed) data[guildId].welcomeEmbed = {};
                    data[guildId].welcomeEmbed[selectedOption] = newValue;

                    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

                    await modalInteraction.reply({ content: `${label} a été mis à jour avec succès !`, ephemeral: true });
                    await message.reply({ content: "Voulez-vous personnaliser un autre élément ?", components: [selectMenu], ephemeral: true });
                })
                .catch(console.error);
        });
    }
};
