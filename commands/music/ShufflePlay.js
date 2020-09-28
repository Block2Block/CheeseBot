module.exports = {
    cmd: "shuffleplay",
    arguments: "shuffleplay [YouTube Playlist URL/Search Query]",
    aliases: ["playshuffle", "shufflesongs"],
    desc: "Play a shuffled playlist on the bot. Only works with playlists when there is nothing currently playing.",
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
            if (client.voice.connections.keyArray().includes(botConstants.guildId)) {
                if (client.voice.connections.get(botConstants.guildId).channel.id !== client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel.id) {
                    await msg.reply("You must be in the same voice channel as the bot in order to do that.");
                    return;
                }
            }

            if (args.length >= 1) {
                await ConnectionManager.playCommand(args[0], msg, logger, true);
            } else {
                await msg.reply("Invalid Arguments. Correct Arguments: **!shuffleplay [YouTube Playlist URL/YouTube Search Query]**");
            }

        } else {
            await msg.reply("You must be in a voice channel in order to do that.");
        }
    }
};