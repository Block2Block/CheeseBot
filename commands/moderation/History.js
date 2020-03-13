module.exports = {
    cmd: "history",
    arguments: "history [Mentioned User]",
    aliases: ["ph","punishmenthistory"],
    desc: "View the punishment history of a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: false,
    run: async function(msg, args, ConnectionManager, PunishmentManager, logger) {
        await PunishmentManager.history(msg, logger);
    }
};