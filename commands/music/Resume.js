module.exports = {
    cmd: "resume",
    arguments: "resume",
    aliases: ["resumeplayback"],
    desc: "Resumes playback of the current song.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    run: async function(msg, args, ConnectionManager, PunishmentManager) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        if (msg.member.voice.channel) {
            if (client.voice.connections.keyArray().includes(botConstants.guildId)) {
                if (client.voice.connections.get(botConstants.guildId).channel.id === msg.member.voice.channel.id) {
                    await ConnectionManager.resume(msg);
                } else {
                    await msg.reply("You must be in the same voice channel as the bot in order to do that.");
                }
            } else {
                await msg.reply("The bot must be in a channel in order to use that command.");
            }
        } else {
            await msg.reply("You must be in a voice channel in order to do that.");
        }
    }
};