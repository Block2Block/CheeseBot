const MySQLManager = require("./mysqlmanager");
const Discord = require("discord.js");
let punishments = [];
const punishmentmanager = {};

punishmentmanager.mute = async function (msg, client) {
    const args = msg.content.split(" ");
    if (args.length < 4) {
        return msg.reply("Invalid arguments. Correct arguments: **!mute [user] [length] [reason]**");
    }
    let re = /<@![0-9]{17,18}>/;
    let user, punisher, reason, timestamp, expire;
    let type = 1;
    let status = 1;
    if (re.test(args[1])) {
        user = args[1].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to punish.");
            return;
        }

    }

    if (client.guilds.get("105235654727704576").members.get(user).roles.keyArray().includes("429970242916319244")) {
        await msg.reply("That user is already muted.");
        return;
    }

    punisher = msg.author.tag;
    reason = "";
    for (let i = 3; i < args.length; i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();
    timestamp = (new Date()).getTime();
    switch (args[2]) {
        case "1":
            expire = timestamp + (60000);
            break;
        case "2":
            expire = timestamp + (60000 * 60 * 48);
            break;
        case "3":
            expire = -1;
            break;
    }

    await MySQLManager.punish(user, type, timestamp, expire, punisher, reason, status, id => {
        client.guilds.get("105235654727704576").members.get(user).addRole("429970242916319244").catch((err) => {
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
        });

        let timer;
        if (expire === -1) {
            timer = null;
        } else {
            timer = setTimeout(async () => {
                if (client.guilds.get("105235654727704576").members.keyArray().includes(user)) {
                    if (client.guilds.get("105235654727704576").members.get(user).roles.keyArray().includes("429970242916319244")) {
                        client.guilds.get("105235654727704576").members.get(user).removeRole("429970242916319244").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                        client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
                            .setAuthor(client.guilds.get("105235654727704576").members.get(user).user.tag, client.guilds.get("105235654727704576").members.get(user).user.displayAvatarURL)
                            .setDescription(client.guilds.get("105235654727704576").members.get(user).user.tag + " has been unmuted.")
                            .addField("Reason", "Expired")
                            .setTimestamp()
                            .setColor('#00AA00'));
                    }
                }

                await MySQLManager.expire(user, id);

            }, expire - timestamp);
        }


        let punishment = {
            id: id,
            user: user,
            discord_id: user,
            type: type,
            timestamp: timestamp,
            expire: expire,
            punisher: punisher,
            reason: reason,
            timer: timer,
            status: 1,
            removal_reason: null,
            remover: null
        };

        punishments.push(punishment);

        let time = ((expire - timestamp) / 60000 / 60);
        let suffix = "hours";
        if (time >= 24) {
            time = (time / 24);
            suffix = "days";
        }

        client.guilds.get("105235654727704576").members.get(user).createDM().then(dmchannel => {
            dmchannel.send("You have been muted in The Cult of Cheese Discord for **" + ((expire === -1) ? "Permanent" : time + " " + suffix) + "**. Reason: **" + reason + "**");
        }).catch((reason) => {
            console.log("Login Promise Rejection: " + reason);
        });
        msg.reply("You have muted " + client.guilds.get("105235654727704576").members.get(user).user.tag + " for " + ((expire === -1) ? "Permanent" : time + " " + suffix) + ".");
        client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
            .setAuthor(client.guilds.get("105235654727704576").members.get(user).user.tag, client.guilds.get("105235654727704576").members.get(user).user.displayAvatarURL)
            .setDescription(client.guilds.get("105235654727704576").members.get(user).user.tag + " has been muted.")
            .addField("Punisher", msg.author.tag)
            .addField("Length", ((expire === -1) ? "Permanent" : time + " " + suffix))
            .addField("Reason", reason)
            .setTimestamp()
            .setColor('#AA0000'));
    });
};

punishmentmanager.ban = async function (msg, client) {
    const args = msg.content.split(" ");
    if (args.length < 4) {
        return msg.reply("Invalid arguments. Correct arguments: **!ban [user] [length] [reason]**");
    }
    let re = /<@![0-9]{17,18}>/;
    let user, punisher, reason, timestamp, expire;
    let type = 2;
    let status = 1;
    if (re.test(args[1])) {
        user = args[1].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to punish.");
            return;
        }

    }

    punisher = msg.author.tag;
    reason = "";
    for (let i = 3; i < args.length; i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();
    timestamp = (new Date()).getTime();
    switch (args[2]) {
        case "1":
            expire = timestamp + (60000);
            break;
        case "2":
            expire = timestamp + (60000 * 60 * 48);
            break;
        case "3":
            expire = -1;
            break;
    }

    await MySQLManager.punish(user, type, timestamp, expire, punisher, reason, status, id => {

        let time = ((expire - timestamp) / 60000 / 60);
        let suffix = "hours";
        if (time >= 24) {
            time = (time / 24);
            suffix = "days";
        }

        client.guilds.get("105235654727704576").members.get(user).createDM().then(dmchannel => {
            dmchannel.send("You have been banned from The Cult of Cheese Discord for **" + ((expire === -1) ? "Permanent" : time + " " + suffix) + "**. Reason: **" + reason + "**");
        }).catch((reason) => {
            console.log("Login Promise Rejection: " + reason);
        });
        msg.reply("You have banned " + client.guilds.get("105235654727704576").members.get(user).user.tag + " for " + ((expire === -1) ? "Permanent" : time + " " + suffix) + ".");
        client.guilds.get("105235654727704576").members.get(user).kick("Ban by Moderator. Reason: " + reason);
        client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
            .setAuthor(client.guilds.get("105235654727704576").members.get(user).user.tag, client.guilds.get("105235654727704576").members.get(user).user.displayAvatarURL)
            .setDescription(client.guilds.get("105235654727704576").members.get(user).user.tag + " has been banned.")
            .addField("Punisher", msg.author.tag)
            .addField("Length", ((expire === -1) ? "Permanent" : time + " " + suffix))
            .addField("Reason", reason)
            .setTimestamp()
            .setColor('#AA0000'));
    });
};

punishmentmanager.getPunish = async function (user, callback) {
    await MySQLManager.getPunishments(user, (punishments) => {
        callback(punishments);
    });
};

punishmentmanager.expire = async function (user, punishment_id) {
    await MySQLManager.expire(user, punishment_id);
};

punishmentmanager.addPunishment = async function (punishment) {
    punishments.push(punishment);
};

punishmentmanager.unmute = async function (msg, client) {

    let args = msg.content.split(" ");
    let re = /<@![0-9]{17,18}>/;
    let user;
    let punish_id = -1;

    if (re.test(args[1])) {
        user = args[1].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to unmute (they must be in the discord).");
            return;
        }

    }

    let reason = "";

    for (let i = 2; i < args.length; i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();


    let newPunishments = [];
    for (let punishment of punishments) {
        if (user === punishment.discord_id) {
            if (punish_id > 0 && punish_id === punishment.id) {
                clearTimeout(punishment.timer);
                continue;
            } else if (punishment.timer != null) {
                clearTimeout(punishment.timer);
                punish_id = punishment.id;
                continue;
            } else {
                newPunishments.push(punishment)
            }
        }
        newPunishments.push(punishment);
    }

    punishments = newPunishments;


    if (client.guilds.get("105235654727704576").members.keyArray().includes(user)) {
        if (client.guilds.get("105235654727704576").members.get(user).roles.keyArray().includes("429970242916319244")) {
            client.guilds.get("105235654727704576").members.get(user).removeRole("429970242916319244").catch((err) => {
                client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                msg.reply("Something went wrong.");
            });
        }
    }

    msg.reply("Punishment removed.");
    await MySQLManager.removePunishment(punish_id, reason, msg.author);
    client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
        .setAuthor(client.guilds.get("105235654727704576").members.get(user).user.tag, client.guilds.get("105235654727704576").members.get(user).user.displayAvatarURL)
        .setDescription(client.guilds.get("105235654727704576").members.get(user).user.tag + " has been unmuted.")
        .addField("Remover", msg.author.tag)
        .addField("Reason", reason)
        .setTimestamp()
        .setColor('#00AA00'));

};

punishmentmanager.unban = async function (msg, client) {
    let args = msg.content.split(" ");
    let re = /[0-9]{17,18}/;
    let user;

    if (re.test(args[1])) {
        user = args[1].toString();
    } else {
        await msg.reply("You must include a user ID in order to unban.");
        return;
    }

    let reason = "";

    for (let i = 2; i < args.length; i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();

    msg.reply("Punishment removed.");
    await MySQLManager.removeBan(user, reason, msg.author);
    client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
        .setAuthor(client.guilds.get("105235654727704576").members.get(user).user.tag, client.guilds.get("105235654727704576").members.get(user).user.displayAvatarURL)
        .setDescription(client.guilds.get("105235654727704576").members.get(user).user.tag + " has been unbanned.")
        .addField("Remover", msg.author.tag)
        .addField("Reason", reason)
        .setTimestamp()
        .setColor('#00AA00'));
};

punishmentmanager.history = async function (msg, client) {

    let args = msg.content.split(" ");
    let re = /<@![0-9]{17,18}>/;
    let user;

    if (re.test(args[1])) {
        user = args[1].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to unmute (they must be in the discord).");
            return;
        }

    }
    await MySQLManager.getPunishments(user, (userPunishments) => {
        let richEmbed = new Discord.RichEmbed();
        richEmbed.setTitle(client.guilds.get("105235654727704576").members.get(user).user.tag + "'s Punishment History")
            .setColor('#2980B9')
            .setFooter("Discord ID: " + user);
        if (userPunishments.length !== 0) {
            for (let punishment of userPunishments) {
                let time = (((new Date).getTime() - punishment.timestamp) / 60000);
                let suffix = "minutes";
                if (time >= 60) {
                    time = (time / 60);
                    suffix = "hours";
                    if (time >= 24) {
                        time = (time / 24);
                        suffix = "days";
                    }
                }

                time = Math.round(time);
                let time2 = ((punishment.expire - punishment.timestamp) / 60000 / 60);
                let suffix2 = "hours";
                if (time >= 24) {
                    time = (time / 24);
                    suffix = "days";
                }
                let x = "**Punisher:** " + punishment.punisher + "\n" +
                    "**Type:** " + ((punishment.type === 2) ? "Ban" : "Mute") + "\n" +
                    "**When:** " + time + " " + suffix + " ago\n" +
                    "**Length:** " + ((punishment.expire === -1) ? "Permanent" : time2 + " " + suffix2) + "\n" +
                    "**Reason:** " + punishment.reason + "";
                if (punishment.status !== 1) {
                    if (punishment.status === 2) {
                        x += "\n**Removed By:** CheeseBot\n**Removal Reason:** Expired";
                    } else {
                        x += "\n**Removed By:** " + punishment.remover + "\n**Removal Reason:** " + punishment.removal_reason;
                    }
                }
                richEmbed.addField("Punishment #" + punishment.id, x);
            }

        } else {
            richEmbed.setDescription("No punishment history found.");
        }

        msg.channel.send(richEmbed);
    });

};

punishmentmanager.removePunishment = async function (user) {
    for (let punishment of punishments) {
        if (user.id.toString() === punishment.discord_id) {
            if (punishment.timer != null) {
                clearTimeout(punishment.timer);
            }
        }
    }
};


module.exports = punishmentmanager;