module.exports = {
    cmd: "addrole",
    arguments: "addrole [tagged role] [reaction emoji] [type] [description]",
    aliases: ["addjoinablerole"],
    desc: "Add a joinable role.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        await RoleManager.addRole(msg, args, PunishmentManager.getMySQLManager(), logger);
    }
};