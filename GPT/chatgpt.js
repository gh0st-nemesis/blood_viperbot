const OpenAI = require("openai");
const Discord = require("discord.js");
const config = require('../configs.json')

const openai = new OpenAI({
    apiKey: config.openai_key,
});


module.exports = {
    name: "chatgpt",
    description: "Pose une question à ChatGPT et reçois une réponse.",
    permission: "Aucune",
    dm: false,
    category: "ChatGPT",
    options: [
        {
            type: "string",
            name: "question",
            description: "La question que vous voulez poser à ChatGPT.",
            required: true,
            autocomplete: false,
        },
    ],
   

    async run(bot, interaction, args) {
        const question = interaction.options.getString("question");
        await interaction.reply("⏳ Je réfléchis...");

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: question }],
                max_tokens: 200,
                temperature: 0.7,
            });

            const answer = completion.choices[0].message.content;
            await interaction.editReply(`💬 **Question :** ${question}\n\n💡 **Réponse :** ${answer}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ Une erreur s'est produite.");
        }
    },
};
