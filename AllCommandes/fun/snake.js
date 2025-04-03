const Discord = require('discord.js');

module.exports = {
    name: "snake",
    description: "Joue au jeu Snake avec toi!",
    category: "Jeu",
    permission: "Aucune",
    dm: true,
    async run(bot, message, args) {
        const gridSize = 10;
        const initialSnake = [
            { x: 2, y: 2 }
        ];
        let snake = [...initialSnake];
        let direction = 'RIGHT';
        let fruit = { x: 4, y: 4 };
        let score = 0;
        let gameOver = false;

        const drawGame = () => {
            let grid = '';
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (snake.some(segment => segment.x === x && segment.y === y)) {
                        grid += '🟩';
                    } else if (fruit.x === x && fruit.y === y) {
                        grid += '🍏';
                    } else {
                        grid += '⬛';
                    }
                }
                grid += '\n';
            }
            return grid;
        };

        const moveSnake = () => {
            const head = { ...snake[0] };
            if (direction === 'UP') head.y--;
            if (direction === 'DOWN') head.y++;
            if (direction === 'LEFT') head.x--;
            if (direction === 'RIGHT') head.x++;

            if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                head.x = (head.x + gridSize) % gridSize;
                head.y = (head.y + gridSize) % gridSize;
            }

            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver = true;
                return;
            }

            snake.unshift(head);

            if (head.x === fruit.x && head.y === fruit.y) {
                score += 10;
                fruit = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
            } else {
                snake.pop();
            }
        };

        const filter = (reaction, user) => {
            return ['⬆️', '⬇️', '⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.user.id;
        };

        const gameMessage = await message.channel.send('Le jeu Snake a commencé ! Utilise les réactions pour jouer !');
        await gameMessage.react('⬆️');
        await gameMessage.react('⬇️');
        await gameMessage.react('⬅️');
        await gameMessage.react('➡️');

        const updateGame = async () => {
            if (gameOver) {
                return gameMessage.edit(`Game Over! Tu as perdu !\nTon score : ${score}`);
            }

            moveSnake();
            await gameMessage.edit(`${drawGame()}\n**Score** : ${score}`);
        };

        const collector = gameMessage.createReactionCollector({ filter, time: 60000 });
        
        collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '⬆️' && direction !== 'DOWN') direction = 'UP';
            if (reaction.emoji.name === '⬇️' && direction !== 'UP') direction = 'DOWN';
            if (reaction.emoji.name === '⬅️' && direction !== 'RIGHT') direction = 'LEFT';
            if (reaction.emoji.name === '➡️' && direction !== 'LEFT') direction = 'RIGHT';
            
            await reaction.users.remove(message.user.id);
        });

        const gameInterval = setInterval(async () => {
            if (gameOver) {
                clearInterval(gameInterval);
                return;
            }
            await updateGame();
        }, 500);
    }
};
