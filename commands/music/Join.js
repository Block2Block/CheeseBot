module.exports = {
    cmd: "join",
    arguments: "join",
    aliases: ["joinchannel"],
    desc: "Makes the bot join your current voice channel. Must be in a channel.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, logger) {
        let botConstants = require("../../utils/Constants.js").getBotConstants();

        if (msg.client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel) {
            await ConnectionManager.joinChannel(msg.client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel, msg, msg.client, (success) => {
                if (success) {
                    msg.reply("Successfully joined your channel!");
                } else {
                    msg.reply("Failed to join your channel!")
                }
            });


        } else {
            await msg.reply("You must be in a voice channel first.");
        }
    }
};