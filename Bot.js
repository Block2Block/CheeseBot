//Loading in environment variables.
const dotenv = require('dotenv');
dotenv.config();

//Loading in external libraries.
const discord = require("discord.js");

//Loading in constants.
const token = process.env.BOT_TOKEN;
const client = new discord.Client();
const botConstants = {
    guildId: "105235654727704576",
    botLoggingChannel: "429972539905671168",
    moderationLoggingChannel: "434005566801707009",
    serverLoggingChannel: "429970564552065024",
    mutedRole: "429970242916319244",
    memberRole: "664631743499993098",
    gameRole: "664626926127677440",
    nowPlayingChannel: "643571367715012638",
    commandPrefix: "!"
};


//Loading module export object.
const bot = {
    getClient: function () {
        return client;
    },
    getBotConstants: function () {
        return botConstants
    }
};

//Loading in internal libraries.
const Punishments = require("./managers/PunishmentManager.js");
const CommandManager = require("./managers/CommandManager.js");
const ConnectionManager = require("./managers/ConnectionManager.js");
const EventManager = require("./managers/EventManager.js");

//Connect function, so it can be called later in-case of bot downtime.
function connect() {
    client.login(token).catch((err) => {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(connect, 2000);
        }
    });
}

connect();

client.on('ready', () => {EventManager.ready()});

client.on('guildMemberAdd', (member) => {
    EventManager.join(member);
});

client.on('guildMemberRemove', (member) => {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
            .setTitle("User Leave")
            .setThumbnail(member.user.displayAvatarURL)
            .setDescription(member.user + " has left the server.")
            .setTimestamp()
            .setColor('#AA0000'));

        Punishments.removePunishment(member);
    }
);

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.displayName !== newMember.displayName) {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
            .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
            .setDescription(newMember + " has changed their nickname.")
            .addField("Old Name", oldMember.displayName)
            .addField("New Name", newMember.displayName)
            .setTimestamp()
            .setColor('#2980B9'));
    } else if (oldMember.roles.size !== newMember.roles.size) {
        if (oldMember.roles.size > newMember.roles.size) {
            let role;
            let roles = oldMember.roles.keyArray();
            for (let i = 0; i < roles.length; i++) {
                if (!newMember.roles.keyArray().includes(roles[i])) {
                    role = roles[i];
                    break;
                }
            }
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
                .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
                .setTitle("Role Removed")
                .setDescription(newMember.user + " was removed from the `" + oldMember.roles.get(role).name + "` role.")
                .setColor('#2980B9'));
        } else {
            let role;
            let roles = newMember.roles.keyArray();
            for (let i = 0; i < roles.length; i++) {
                if (!oldMember.roles.keyArray().includes(roles[i])) {
                    role = roles[i];
                    break;
                }
            }
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
                .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
                .setTitle("Role Added")
                .setDescription(newMember.user + " was given the `" + newMember.roles.get(role).name + "` role.")
                .setColor('#2980B9'));
        }
    }
});

client.on('userUpdate', (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
            .setAuthor(newUser.tag, newUser.displayAvatarURL)
            .setDescription(newUser + " has changed their username.")
            .addField("Old Name", oldUser.username)
            .addField("New Name", newUser.username)
            .setTimestamp()
            .setColor('#2980B9'));
    }
});

client.on('guildBanAdd', (guild, user) => {
    client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
        .setAuthor(user.tag, user.displayAvatarURL)
        .setTitle("Manual Ban")
        .setDescription(user + " was manually banned by an admin.")
        .setColor('#AA0000'));
});

client.on('messageDelete', (message) => {
    if (message.guild != null) {
        if (message.content.startsWith("!") || message.author.bot) {
            return;
        }
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("A message by " + message.author + " was deleted in " + message.channel + ".\n" +
            "**Message**: `" + message.content + "`");
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.guild != null) {
        if (oldMessage.author.bot || oldMessage.content === newMessage.content) {
            return;
        }
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(newMessage.author + " edited a message in " + newMessage.channel + ".\n" +
            "**Old**: `" + oldMessage.content + "`\n" +
            "**New**: `" + newMessage.content + "`");
    }
});

client.on('message', (msg) => {
    if (msg.content.startsWith(botConstants.commandPrefix)) {
        CommandManager.onCommand(msg);
    }
});

client.on('error', (error) => {
    console.log("An error has occured. Error: " + error);
    if (client.status === 5) {
        handleDisconnect();
    } else if (client.status === 3 || client.status === 0) {
        client.guilds.get("105235654727704576").channels.get("429972539905671168").send("A" + ((error.fatal)?" fatal ":"n ") +  "error has occured. Error: ```" + error.code + ": " + error.stack + "```")
    }

});

//Catching the process exit in order to cleanly exit.
process.on('exit', () => {
   ConnectionManager.leave();
   client.destroy();
});

//Catching any uncaught exceptions, then restarting the  process.
process.on('uncaughtException', function(err) {
    if (client.status === 3 || client.status === 0) {
        client.guilds.get("105235654727704576").channels.get("429972539905671168").send("A" + ((err.fatal)?" fatal ":"n ") +  "error has occured. Error: ```" + err.code + ": " + err.stack + "```").then(() => {
            console.log('Caught exception: ' + err);
            process.exit(1)
        })
    } else {
        console.log('Caught exception: ' + err);
        process.exit(1)
    }
});

module.exports = bot;
