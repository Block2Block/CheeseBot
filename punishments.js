const MySQLManager = require("./mysqlmanager");
const punishments = [];
const punishmentmanager = {};

punishmentmanager.mute = async function(msg, client) {
    const args = msg.content.split(" ");
    if (args.length < 4) {
        return msg.reply("Invalid arguments. Correct arguments: **!mute [user] [length] [reason]**");
    }
    let re = /<@![0-9]{17,18}>/;
    let user,punisher,reason,timestamp,expire;
    let type = 1;
    let status = 1;
    if (re.test(args[1])) {
        user = args[1].replace("<@!","").replace(">","");
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
    for (let i = 3;i < args.length;i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();
    timestamp = (new Date()).getTime();
    switch(args[2]) {
        case "1":
            expire = timestamp + (60000 *60 *12);
            break;
        case "2":
            expire = timestamp + (60000 *60 *48);
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
                    }
                }}, expire - timestamp);
        }


        let punishment = {
            id: id,
            user: user,
            type: type,
            timestamp: timestamp,
            expire: expire,
            punisher: punisher,
            reason: reason,
            timer: timer,
            status: 1,
            removal_reason: null
        };

        punishments.push(punishment);

        let time = ((expire - timestamp) /60000/60);
        let suffix = "hours";
        if (time >= 24) {
            time = (time / 24);
            suffix = "days";
        }

        msg.channel.send("<@!" + user + "> You have been muted for " + time + " " + suffix + ". Reason: `" + reason + "`");
    });
};

punishmentmanager.ban = async function(msg, client) {
    const args = msg.content.split(" ");
    if (args.length < 4) {
        return msg.reply("Invalid arguments. Correct arguments: **!ban [user] [length] [reason]**");
    }
    let re = /<@![0-9]{17,18}>/;
    let user,punisher,reason,timestamp,expire;
    let type = 2;
    let status = 1;
    if (re.test(args[1])) {
        user = args[1].replace("<@!","").replace(">","");
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
    for (let i = 3;i < args.length;i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();
    timestamp = (new Date()).getTime();
    switch(args[2]) {
        case "1":
            expire = timestamp + (60000 *60 *12);
            break;
        case "2":
            expire = timestamp + (60000 *60 *48);
            break;
        case "3":
            expire = -1;
            break;
    }

    await MySQLManager.punish(user, type, timestamp, expire, punisher, reason, status, id => {

        let time = ((expire - timestamp) /60000/60);
        let suffix = "hours";
        if (time >= 24) {
            time = (time / 24);
            suffix = "days";
        }

        client.guilds.get("105235654727704576").members.get(user.id).createDM().then(dmchannel => {
            dmchannel.send("You have been banned from The Cult of Cheese Discord for **" + ((expire === -1)?"Permanent":time + suffix) + "**. Reason: **" + reason + "**");
        }).catch((reason) => {
            console.log("Login Promise Rejection: " + reason);
        });
        client.guilds.get("105235654727704576").members.get(user.id).kick("Ban by Moderator. Reason: " + reason);
    });
};

punishmentmanager.getPunish = async function(user, callback) {
    callback(await MySQLManager.getPunishments(user));
};

punishmentmanager.expire = async function(user, punishment_id) {
    await MySQLManager.expire(user, punishment_id);
};

punishmentmanager.addPunishment = async function(punishment) {
    punishments.push(punishment);
};

punishmentmanager.removePunishment = async function(user) {
  for (let punishment in punishments) {
      if (user.id.toString() === punishment.discord_id) {
          if (punishment.timer != null) {
              punishment.timer.cancel();
              break;
          }
      }
  }
};

punishmentmanager.unmute = async function(msg, client) {

    let args = msg.content.split(" ");
    let re = /<@![0-9]{17,18}>/;
    let user;
    let punish_id;

    if (re.test(args[1])) {
        user = args[1].replace("<@!","").replace(">","");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to unmute (they must be in the discord).");
            return;
        }

    }

    let reason;

    for (let i = 2;i < args.length;i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();


    for (let punishment in punishments) {
        if (user === punishment.discord_id) {
            if (punishment.timer != null) {
                punishment.timer.cancel();
                punish_id = punishment.id;
                break;
            }
        }
    }

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

};

punishmentmanager.unban = async function(msg, client) {
    let args = msg.content.split(" ");
    let re = /[0-9]{17,18}/;
    let user;

    if (re.test(args[1])) {
        user = args[1].toString();
    } else {
            await msg.reply("You must include a user ID in order to unban.");
            return;
    }

    let reason;

    for (let i = 2;i < args.length;i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();

    msg.reply("Punishment removed.");
    await MySQLManager.removeBan(user, reason, msg.author);
};


module.exports = punishmentmanager;