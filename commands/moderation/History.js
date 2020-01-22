module.exports = {
    cmd: "history",
    arguments: "history [Mentioned User]",
    aliases: ["ph","punishmenthistory"],
    desc: "View the punishment history of a player.",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args) {
        const PunishmentManager = require("../../managers/PunishmentManager.js");
        await PunishmentManager.history(msg);
    }
};