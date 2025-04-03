const { ActivityType } = require('discord.js')
const handlerSlashCommands = require('../Loader/handlerSlashCommands')

module.exports = async bot => {
    await handlerSlashCommands(bot)
    console.clear()
    console.log("============================================")
    console.log(" ")
    console.log(`${bot.user.tag} is connected successfuly !`)
    console.log(" ")
    console.log("============================================")

    bot.user.setPresence({
        activities: [{name: " 月読 - ＴＳＵＫＵＹＯＭＩ server", type: ActivityType.Streaming,  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}],
        status: 'online'
    })
}