module.exports = {
    cmd: "nextsong",
    arguments: "nextsong",
    aliases: ["whatisthenextsong","whatsnext"],
    desc: "Tells you the next song in the playlist.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    run: async function(msg, args, ConnectionManager, PunishmentManager, logger) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        if (client.voice.connections.keyArray().includes(botConstants.guildId)) {
            await ConnectionManager.nextSong(msg);
        } else {
            await msg.reply("The bot must be in a channel in order to use that command.");
        }

    }
};