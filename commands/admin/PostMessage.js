module.exports = {
    cmd: "postmessage",
    arguments: "postmessage [channel] [type]",
    aliases: ["postrolemessage"],
    desc: "Posts a joinable role message.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        await RoleManager.postMessage(msg, args, PunishmentManager.getMySQLManager(), logger)
    }
};