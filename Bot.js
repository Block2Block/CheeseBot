//Loading in environment variables.
const dotenv = require('dotenv');
dotenv.config();

//Loading in external libraries.
const Discord = require("discord.js");

//Loading in constants.
const token = process.env.BOT_TOKEN;
const client = new Discord.Client();
const Constants = require("./utils/Constants.js");
const EventManager = require("./managers/EventManager.js");
const botConstants = Constants.getBotConstants();

const log4js = require('log4js');
log4js.configure({
    appenders: { CheeseBotFile: { type: 'file', filename: 'logs/' + ((new Date()).toDateString()) + '.log' }, CheeseBotConsole: {type: 'console'}},
    categories: { default: { appenders: ['CheeseBotFile','CheeseBotConsole'], level: 'debug' } }
});
const logger = log4js.getLogger();


//Loading in internal libraries.
const CommandManager = require("./managers/CommandManager.js");
CommandManager.load(logger);
const StreamManager = require("./managers/StreamManager.js");

//Connect function, so it can be called later in-case of bot downtime.
function connect() {
    client.login(token).catch((err) => {
        if (err) {
            logger.error('error when connecting to db:', err);
            setTimeout(connect, 2000);
        }
    });
}

connect();

client.on('ready', () => {
    EventManager.ready(client, CommandManager, logger);
    StreamManager.load(client, logger);
});

client.on('guildMemberAdd', (member) => {
    EventManager.join(member, client, CommandManager, logger);
});

client.on('guildMemberRemove', (member) => {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.MessageEmbed()
            .setTitle("User Leave")
            .setThumbnail(member.user.avatarURL())
            .setDescription(member.user.tag + " has left the server.")
            .setTimestamp()
            .setColor('#AA0000'));


    }
);

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.displayName !== newMember.displayName) {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.MessageEmbed()
            .setAuthor(newMember.user.tag, newMember.user.avatarURL())
            .setDescription("<@" + newMember + "> has changed their nickname.")
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
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.MessageEmbed()
                .setAuthor(newMember.user.tag, newMember.user.avatarURL())
                .setTitle("Role Removed")
                .setDescription("<@" + newMember.user + "> was removed from the `" + oldMember.roles.get(role).name + "` role.")
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
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.MessageEmbed()
                .setAuthor(newMember.user.tag, newMember.user.avatarURL())
                .setTitle("Role Added")
                .setDescription("<@" + newMember.user + "> was given the `" + newMember.roles.get(role).name + "` role.")
                .setColor('#2980B9'));
        }
    }
});

client.on('userUpdate', (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.MessageEmbed()
            .setAuthor(newUser.tag, newUser.avatarURL())
            .setDescription("<@" + newUser + "> has changed their username.")
            .addField("Old Name", oldUser.username)
            .addField("New Name", newUser.username)
            .setTimestamp()
            .setColor('#2980B9'));
    }
});

client.on('guildBanAdd', (guild, user) => {
    client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.MessageEmbed()
        .setAuthor(user.tag, user.avatarURL())
        .setTitle("Manual Ban")
        .setDescription(user.tag + " was manually banned by an admin.")
        .setColor('#AA0000'));
});

client.on('messageDelete', (message) => {
    if (message.guild != null) {
        if (message.content.startsWith("!") || message.author.bot) {
            return;
        }
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("A message by <@" + message.author + "> was deleted in <#" + message.channel + ">.\n" +
            "**Message**: `" + message.content + "`");
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.guild != null) {
        if (oldMessage.author.bot || oldMessage.content === newMessage.content) {
            return;
        }
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("<@" + newMessage.author + "> edited a message in <#" + newMessage.channel + ">.\n" +
            "**Old**: `" + oldMessage.content + "`\n" +
            "**New**: `" + newMessage.content + "`");
    }
});

client.on('message', (msg) => {
    if (msg.content.startsWith(botConstants.commandPrefix)) {
        CommandManager.onCommand(msg, client, logger);
    }
});

client.on('error', (error) => {
    console.log("An error has occured. Error: " + error);
    if (client.status === 5) {
        connect();
    } else if (client.status === 3 || client.status === 0) {
        client.guilds.get("105235654727704576").channels.get("429972539905671168").send("A" + ((error.fatal)?" fatal ":"n ") +  "error has occured. Error: ```" + error.code + ": " + error.stack + "```")
    }

});

//Catching the process exit in order to cleanly exit.
process.on('exit', () => {
   CommandManager.getConnectionManager().leave();
   client.destroy();
   StreamManager.end();
});

//Catching any uncaught exceptions, then restarting the  process.
process.on('uncaughtException', function(err) {
    if (client.status === 3 || client.status === 0) {
        client.guilds.get("105235654727704576").channels.get("429972539905671168").send("A" + ((err.fatal)?" fatal ":"n ") +  "error has occured. Error: ```" + err.code + ": " + err.stack + "```").then(() => {
            logger.log('Caught exception: ' + err);
            process.exit(1)
        })
    } else {
        logger.log('Caught exception: ' + err);
        process.exit(1)
    }
});
