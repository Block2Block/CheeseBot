module.exports = {
    cmd: "play",
    arguments: "play [YouTube URL/Search Query]",
    aliases: ["playsong"],
    desc: "Play a song on the bot.",
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
                if (client.voiceConnections.get(botConstants.guildId).channel.id !== msg.member.voiceChannel.id) {
                    await msg.reply("You must be in the same voice channel as the bot in order to do that.");
                    return;
                }
            }

            if (args.length >= 1) {
                await ConnectionManager.playCommand(args[0], msg);
            } else {
                await msg.reply("Invalid Arguments. Correct Arguments: **!play [YouTube URL/YouTube Search Query]**");
            }

        } else {
            await msg.reply("You must be in a voice channel in order to do that.");
        }
    }
};