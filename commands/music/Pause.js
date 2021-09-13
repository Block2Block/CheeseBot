module.exports = {
    cmd: "pause",
    arguments: "pause",
    aliases: ["pauseplayback"],
    desc: "Pauses playback of the current song.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        if (client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel) {
            if (client.voice.connections.has(botConstants.guildId)) {
                if (client.voice.connections.get(botConstants.guildId).channel.id === client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel.id) {
                    await ConnectionManager.pause(msg);
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