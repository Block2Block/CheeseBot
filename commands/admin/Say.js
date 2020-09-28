module.exports = {
    cmd: "say",
    arguments: "say",
    aliases: ["repeat"],
    desc: "Forced the bot to say something.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        //Welcome message.
        if (args.length >= 1) {
            msg.channel.send(args.join(" "));
        }
    }
};