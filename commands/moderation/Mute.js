module.exports = {
    cmd: "mute",
    arguments: "mute [Mentioned User] [1-3] [Reason]",
    aliases: [],
    desc: "Mute a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args, ConnectionManager, PunishmentManager, logger) {
        await PunishmentManager.punish(msg, args, 1, msg.client, logger);
    }
};