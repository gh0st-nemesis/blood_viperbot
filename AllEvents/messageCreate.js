const { EmbedBuilder } = require('discord.js');

module.exports = async (bot, message) => {
   
    if (message.author.bot) return;

   
    if (message.content.toLowerCase() === 'bonjour') {
        message.reply('Bonjour ! Comment ça va ?');
    } else if (message.content.toLowerCase() === 'ça va et toi' || message.content.toLowerCase() === 'cv et toi' || message.content.toLowerCase() === "cv ett") {
        message.reply(`Je vais bien merci ${message.author}`)
    } else if(message.content.toLowerCase() === 'quoi') {
        message.reply("feur")
    }
};
