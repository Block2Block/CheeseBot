module.exports = {
    cmd: "join",
    arguments: "join",
    aliases: ["joinchannel"],
    desc: "Makes the bot join your current voice channel. Must be in a channel.",
    category: "music",
    permission: "music",
    allowed_channels: ["439114294307717131","629807458864463883"],
    joinable_role: null,
    run: async function(msg, args, ConnectionManager, PunishmentManager) {

        if (msg.member.voiceChannel) {
            await ConnectionManager.joinChannel(msg.member.voiceChannel, msg, msg.client, (success) => {
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