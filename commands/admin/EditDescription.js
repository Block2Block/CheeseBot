module.exports = {
    cmd: "editdescription",
    arguments: "editdescription [tagged role] [description]",
    aliases: ["editroledescription"],
    desc: "Edit a joinable role's description.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        await RoleManager.editDescription(msg, args, PunishmentManager.getMySQLManager(), logger)
    }
};