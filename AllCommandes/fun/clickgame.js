const Discord = require('discord.js');

module.exports = {
    name: "clickgame",
    description: "Jeu où tu dois cliquer autant que possible en un temps limité !",
    category: "Jeu",
    permission: "Aucune",
    dm: true,
    async run(bot, message, args) {
        let score = 0;
        let gameOver = false;
        const timeLimit = 10 * 1000;
        const gameChannel = message.channel;

        const gameMessage = await gameChannel.send('Le jeu de clics commence ! Clique sur la réaction ⬇️ pour augmenter ton score !');

        await gameMessage.react('⬇️');

        const filter = (reaction, user) => {
            return reaction.emoji.name === '⬇️' && !user.bot;
        };

        const collector = gameMessage.createReactionCollector({ filter, time: timeLimit });

        collector.on('collect', (reaction, user) => {
            if (!gameOver) {
                score++;
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                gameOver = true;
                await gameMessage.edit(`Le temps est écoulé ! Ton score final est de : **${score}** clics !`);
            }
        });

        const timerInterval = setInterval(async () => {
            if (gameOver) {
                clearInterval(timerInterval);
            } else {
                const timeLeft = Math.max(0, Math.floor((timeLimit - (Date.now() - gameMessage.createdTimestamp)) / 1000));
                await gameMessage.edit(`Le jeu de clics commence ! Clique sur la réaction ⬇️ pour augmenter ton score !\nTemps restant : **${timeLeft} secondes**`);
            }
        }, 1000);
    }
};
