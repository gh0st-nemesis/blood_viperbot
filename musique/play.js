const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { query } = require('ytdl-core');
const ytSearch = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');


module.exports = {
    name: 'play',
    description: 'Commandes musicales pour jouer la musique !',
    permission: "Aucune",
    dm: false,
    category: 'Musique',
    options: [
        {
            type: "string",
            name: "musique",
            description: "Titre ou lien de la musique à jouer",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const query = args.getString('musique');
        const channel = message.member.voice.channel;

        if (!channel) {
            return message.reply("Vous devez être dans un salon vocal pour jouer de la musique.");
        }

        let songUrl;
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('🎶 Musique en cours de préparation 🎶')
            .setDescription('Nous chargeons la musique...');

        await message.reply({ embeds: [embed] });

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        try {
            const results = await ytSearch(query);
            if (results && results.videos.length > 0) {
                songUrl = results.videos[0].url;
            } 
        } catch (error) {
            console.log(error)
            return;
        }

        const songInfo = await ytdl.getInfo(songUrl);
        const songTitle = songInfo.videoDetails.title;

        // Créez un flux audio avec ffmpeg
        const audioStream = ytdl(songUrl, { filter: 'audioonly' });

        const passThrough = new PassThrough();
        
        ffmpeg(audioStream)
            .audioCodec('libopus') // Utilisez Opus pour une qualité optimale dans Discord
            .format('ogg')
            .pipe(passThrough, { end: true });

        const audioResource = createAudioResource(passThrough);

        const audioPlayer = createAudioPlayer();
        audioPlayer.play(audioResource);

        connection.subscribe(audioPlayer);

        // Une fois que la musique commence, on met à jour l'embed
        const playingEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('🎶 Musique en cours de lecture 🎶')
            .setDescription(`**${songTitle}** est maintenant en train de jouer dans ${channel.name}.`);

        await message.channel.send({ embeds: [playingEmbed] });

        // Quand la musique se termine, détruire la connexion
        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log('La musique a terminé.');
            connection.destroy();
        });
    }
};