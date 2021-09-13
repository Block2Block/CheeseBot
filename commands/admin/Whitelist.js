module.exports = {
    cmd: "whitelist",
    arguments: "whitelist [add|remove] [domain]",
    aliases: [],
    desc: "Forced the bot to say something.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger, SpamManager) {
        //Welcome message.
        if (args.length === 2) {
            if (args[0].toLowerCase() === "add") {
                PunishmentManager.getMySQLManager().addToWhitelist(args[1].toLowerCase(), logger);
                SpamManager.addToWhitelist(args[1].toLowerCase());
                msg.reply("Successfully added to whitelist.");
            } else if (args[0].toLowerCase() === "remove") {
                PunishmentManager.getMySQLManager().removeFromWhitelist(args[1].toLowerCase(), logger);
                SpamManager.removeFromWhitelist(args[1].toLowerCase());
                msg.reply("Successfully removed from whitelist.");
            }
        }
    }
};