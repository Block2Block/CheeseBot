module.exports = {
    cmd: "queueinfo",
    arguments: "queueinfo",
    aliases: ["queue","queuestats"],
    desc: "Tells you information about the queue",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        if (client.voice.connections.keyArray().includes(botConstants.guildId)) {
            await ConnectionManager.queueInfo(msg);
        } else {
            await msg.reply("The bot must be in a channel in order to use that command.");
        }

    }
};