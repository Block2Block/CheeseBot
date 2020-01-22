module.exports = {
    cmd: "ban",
    arguments: "ban [Mentioned User] [1-3] [Reason]",
    aliases: [],
    desc: "Ban a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args) {
        const PunishmentManager = require("../../managers/PunishmentManager.js");
        await PunishmentManager.punish(msg, args, 2);
    }
};