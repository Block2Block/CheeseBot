module.exports = {
    cmd: "restart",
    arguments: "restart",
    aliases: ["reload","exit","end"],
    desc: "Restarts the bot.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        await msg.reply("Restarting bot...");
        await client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("Restarting bot...");
        process.exit(0);
    }
};