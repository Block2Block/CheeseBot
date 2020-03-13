module.exports = {
    cmd: "agree",
    arguments: "agree",
    aliases: [],
    desc: "Agree to the rules and enter the Discord.",
    category: "confirmation",
    permission: "confirmation",
    allowed_channels: "684894179112779828",
    joinable_role: null,
    allow_in_dm: false,
    run: async function(msg, args, ConnectionManager, PunishmentManager, logger) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        await msg.reply("You have agreed to the rules. Welcome to the Cult of Cheese! We hope you have fun, now get chatting!");
        await client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.serverLoggingChannel).send("<@" + msg.member.id + "> has agreed to the rules.");
        msg.member.roles.add(botConstants.memberRole).catch((err) => {
            client.guilds.cache.get(botConstants.guildId).channels.cache.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
        });
    }
};