const Discord = require('discord.js')
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents})
const handlerCommand = require('./Loader/handlerCommands')
const handlerEvents = require('./Loader/handlerEvents')


const configs = require('./configs.json')
bot.commands = new Discord.Collection()

handlerCommand(bot)
handlerEvents(bot)

bot.login(configs.token)

