module.exports = {
    cmd: "volume",
    arguments: "volume [1-10]",
    aliases: ["vol","v"],
    desc: "Makes the bot leave the channel it is currently in.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    run: async function(msg, args) {
        const ConnectionManager = require("../../managers/ConnectionManager.js");
        const Bot = require("../../managers/EventManager.js");

        const client = Bot.getClient();
        const botConstants = Bot.getBotConstants();


        if (client.voiceConnections.keyArray().includes(botConstants.guildId)) {
            if (msg.member.voiceChannel) {
                if (client.voiceConnections.get(botConstants.guildId).channel.id !== msg.member.voiceChannel.id) {
                    await msg.reply("You must be in the same voice channel as the bot in order to do that.");
                    return;
                }
            } else {
                await msg.reply("You must be in the same voice channel as the bot in order to do that.");
                return;
            }

        }
        if (args.length === 1) {
            let volume;
            try {
                volume = parseInt(args[0]);
            } catch (err) {
                await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                return;
            }

            if (volume > 10 || volume < 1 || args[0].includes(".")) {
                await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                return;
            }

            await ConnectionManager.volume(msg, volume);
        } else {
            await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
        }

    }
};