module.exports = {
    cmd: "purge",
    arguments: "purge [Amount of Messages]",
    aliases: [],
    desc: "Purge messages from a channel",
    category: "moderation",
    permission: "moderation",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: false,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        if (args.length > 0) {
            let re = /[0-9]+/
            if (!re.test(args[0])) {
                msg.reply("Invalid syntax. Correct syntax: **!purge [Amount of Messages]**");
                return;
            }
            let amount;
            try {
                amount = parseInt(args[0]);
            } catch (err) {
                msg.reply("Invalid syntax. Correct syntax: **!purge [Amount of Messages]**");
                return;
            }


            await msg.channel.bulkDelete(amount)
                .then (messages => {msg.channel.send("Purged " + messages.size + " messages.")})
                .catch(err => {
                    msg.reply("Something went wrong. Error: " + err.name + "\n" + err.message);
                });
        } else {
            msg.reply("Invalid syntax. Correct syntax: **!purge [Amount of Messages]**");
        }
    }
};