module.exports = {
    cmd: "ban",
    arguments: "ban [Mentioned User] [1-3] [Reason]",
    aliases: [],
    desc: "Ban a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: false,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        await PunishmentManager.punish(msg, args, 2, msg.client, logger);
    }
};