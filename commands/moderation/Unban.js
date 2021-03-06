module.exports = {
    cmd: "unban",
    arguments: "unban [Mentioned User] [Reason]",
    aliases: [],
    desc: "Unban a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: false,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        await PunishmentManager.unpunish(msg, args, 2, msg.client, logger);
    }
};