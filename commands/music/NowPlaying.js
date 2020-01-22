module.exports = {
    cmd: "nowplaying",
    arguments: "nowplaying",
    aliases: ["playing","np"],
    desc: "Displays the song the bot is currently playing.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    run: async function(msg, args) {
        const ConnectionManager = require("../../managers/ConnectionManager.js");
        const Bot = require("../../Bot.js");

        const client = Bot.getClient();
        const botConstants = Bot.getBotConstants();

        if (client.voiceConnections.keyArray().includes(botConstants.guildId)) {
            await ConnectionManager.nowPlaying(msg);
        } else {
            await msg.reply("The bot must be in a channel in order to use that command.");
        }

    }
};