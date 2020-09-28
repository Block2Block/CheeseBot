module.exports = {
    cmd: "removerole",
    arguments: "removerole [tagged role]",
    aliases: ["removejoinablerole"],
    desc: "Remove a joinable role.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        await RoleManager.removeRole(msg, args, PunishmentManager.getMySQLManager(), logger)
    }
};