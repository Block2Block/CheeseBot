module.exports = {
    cmd: "restart",
    arguments: "restart",
    aliases: ["reload","exit","end"],
    desc: "Restarts the bot.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args) {
        const Bot = require("../../Bot.js");

        const client = Bot.getClient();
        const botConstants = Bot.getBotConstants();

        await msg.reply("Restarting bot...");
        await client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("Restarting bot...");
        process.exit(0);
    }
};