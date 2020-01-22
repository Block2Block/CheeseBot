module.exports = {
    cmd: "unmute",
    arguments: "unmute [Mentioned User] [Reason]",
    aliases: [],
    desc: "Unmute a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args, ConnectionManager, PunishmentManager) {
        await PunishmentManager.unpunish(msg, args, 1);
    }
};