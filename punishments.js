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
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
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
        client.guilds.get("105235654727704576").members.get(user).addRole("429970242916319244").catch((err) => {
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
        });

        let timer = null;
        client.guilds.get("105235654727704576").members.get(user.id).kick("Ban from Moderator. Reason: " + reason);

        let punishment = {
            id: id,
            user: user,
            type: type,
            timestamp: timestamp,
            expire: expire,
            punisher: punisher,
            reason: reason,
            timer: timer,
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

function generateLengths(id, type, severity) {

}

module.exports = punishmentmanager;