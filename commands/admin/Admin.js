module.exports = {
    cmd: "admin",
    arguments: "admin [tagged user/ID]",
    aliases: ["toggleadmin"],
    desc: "Make a member an Guard of the Cult of Cheese.",
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
                        await msg.reply("You must mention a user/id in order to make someone a master.");
                        return;
                    }
                }
            }

            if (client.guilds.cache.get(botConstants.guildId).members.cache.has(user)) {
                if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.adminRole)) {
                    await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.remove(botConstants.adminRole);
                    if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.memberRole)) {
                        if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.initiateRole) && !client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.modRole)) {
                            await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.add(botConstants.memberRole);
                        }
                    }
                    msg.reply("<@" + user + "> has been removed as a master!");
                } else {
                    await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.add(botConstants.adminRole);
                    if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.memberRole)) {
                        await client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.remove(botConstants.memberRole);
                    }
                    msg.reply("<@" + user + "> has been made a master!");
                }
            } else {
                msg.reply("That user is not in this discord.")
            }
        } else {
            msg.reply("Invalid syntax. Correct syntax: **!initiate [tagged user/ID]**")
        }
    }
};