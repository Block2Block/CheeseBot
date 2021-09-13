const {getVoiceConnection} = require("@discordjs/voice");
module.exports = {
    cmd: "skip",
    arguments: "skip",
    aliases: ["next","skipsong"],
    desc: "Skips the currently playing song.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        const Bot = require("../../utils/Constants.js");

        const client = msg.client;
        const botConstants = Bot.getBotConstants();

        const { getVoiceConnection } = require('@discordjs/voice');

        if (client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel) {
            let connection = getVoiceConnection(botConstants.guildId);
            if (connection) {
                if (connection.joinConfig.channelId === client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel.id) {
                    await ConnectionManager.skip(msg, logger);
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