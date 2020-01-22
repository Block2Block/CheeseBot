module.exports = {
    cmd: "repeat",
    arguments: "repeat",
    aliases: [],
    desc: "Turns on repeat mode on the bot.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    run: async function(msg, args) {
        const ConnectionManager = require("../../managers/ConnectionManager.js");
        const Bot = require("../../managers/EventManager.js");

        const client = Bot.getClient();
        const botConstants = Bot.getBotConstants();

        if (msg.member.voiceChannel) {
            if (client.voiceConnections.keyArray().includes(botConstants.guildId)) {
                if (client.voiceConnections.get(botConstants.guildId).channel.id === msg.member.voiceChannel.id) {
                    await ConnectionManager.repeat(msg);
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