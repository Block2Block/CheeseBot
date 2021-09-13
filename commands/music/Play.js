const {getVoiceConnection} = require("@discordjs/voice");
module.exports = {
    cmd: "play",
    arguments: "play [YouTube URL/Search Query]",
    aliases: ["playsong"],
    desc: "Play a song on the bot.",
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
                if (connection.joinConfig.channelId !== client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel.id) {
                    await msg.reply("You must be in the same voice channel as the bot in order to do that.");
                    return;
                }
            }

            if (args.length >= 1) {
                await ConnectionManager.playCommand(args[0], msg, logger, false);
            } else {
                await msg.reply("Invalid Arguments. Correct Arguments: **!play [YouTube URL/YouTube Search Query]**");
            }

        } else {
            await msg.reply("You must be in a voice channel in order to do that.");
        }
    }
};