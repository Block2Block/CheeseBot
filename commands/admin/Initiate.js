module.exports = {
    cmd: "initiate",
    arguments: "initiate [tagged user/ID]",
    aliases: ["toggleinitiate"],
    desc: "Make a member an initiated member of the Cult of Cheese.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        if (args.length === 1) {
            let botConstants = require('../../utils/Constants.js').getBotConstants();
            let user;
            let client = msg.client;
            let re = /<@![0-9]{17,18}>/;
            if (re.test(args[0])) {
                user = args[0].replace("<@!", "").replace(">", "");
            } else {
                //Mobile is weird so needs this extra thing
                re = /<@[0-9]{17,18}>/;
                if (re.test(args[0])) {
                    user = args[0].replace("<@", "").replace(">", "");
                } else {
                    re = /[0-9]{17,18}/;
                    if (re.test(args[0])) {
                        user = args[0];
                    } else {
                        await msg.reply("You must mention a user/id in order to initiate someone.");
                        return;
                    }
                }
            }

            if (client.guilds.cache.get(botConstants.guildId).members.cache.has(user)) {
                if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.initiateRole)) {
                    await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.remove(botConstants.initiateRole);
                    if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.memberRole)) {
                        if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.modRole) && !client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.adminRole)) {
                            await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.add(botConstants.memberRole);
                        }
                    }
                    msg.reply("<@" + user + "> has been un-initiated!");
                } else {
                    await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.add(botConstants.initiateRole);
                    if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.memberRole)) {
                        await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.remove(botConstants.memberRole);
                    }
                    msg.reply("<@" + user + "> has been initiated!");
                }
            } else {
                msg.reply("That user is not in this discord.")
            }
        } else {
            msg.reply("Invalid syntax. Correct syntax: **!initiate [tagged user/ID]**")
        }
    }
};