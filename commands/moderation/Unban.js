module.exports = {
    cmd: "unban",
    arguments: "unban [Mentioned User] [Reason]",
    aliases: [],
    desc: "Unban a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args) {
        const PunishmentManager = require("../../managers/PunishmentManager.js");
        await PunishmentManager.unpunish(msg, args, 2);
    }
};