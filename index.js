const index  = {};
const Discord = require("discord.js");
const Punishments = require("./punishments.js");
const token = 'NjQxMDQxNjYzMzQyNDExNzk2.XcCnoQ.EcvG7W9FE9TYoGFduk0GYyysbwM';
const CommandManager = require("./commandmanager.js");
const MySQLManagaer = require("./mysqlmanager.js");

const client = new Discord.Client();

client.login(token);

client.on('ready', () => {
    console.log("The discord bot has been successfully loaded.");
    //client.guilds.get("593184312468307977").channels.get("593193237955608627").send("The bot has been successfully started!");
    client.user.setStatus("online");
    client.user.setActivity("on The Cult of Cheese", {type: "PLAYING"})
});

client.on('guildMemberAdd', (member) => {
    let channel = member.guild.channels.get("429970564552065024");
    channel.send(new Discord.RichEmbed()
        .setTitle("User Join")
        .setThumbnail(member.user.displayAvatarURL)
        .setDescription(member.user + " has joined the server.")
        .setTimestamp()
        .setColor('#00AA00'));
    member.createDM().then(dmchannel => {
        dmchannel.send(new Discord.RichEmbed()
            .setAuthor("Block2Block","https://images-ext-2.discordapp.net/external/_qMCj5_iGSM4MIVfSm5qD3pLLXlUNGCObv_GRVPblpk/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/105235320714326016/456d3e040de0ec913b23aa309c5083e3.png")
            .setTitle("Welcome!")
            .setDescription("Welcome to the Cult of Cheese! We hope you enjoy your time here! Please read #read-me in order to get started.\n" +
                "\n" +
                "🧀 EMBRACE THE POWER OF THE CHEESE 🧀")
            .setColor('#FFAB00'));
    }).catch((reason) => {
        console.log("Login Promise Rejection: " + reason);
    });

    member.addRole("664631743499993098").catch((err) => {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
    });
});

client.on('guildMemberRemove', (member) => {
    client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
        .setTitle("User Leave")
        .setThumbnail(member.user.displayAvatarURL)
        .setDescription(member.user + " has left the server.")
        .setTimestamp()
        .setColor('#AA0000'));
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
            for (let i = 0;i < roles.length;i++) {
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
            for (let i = 0;i < roles.length;i++) {
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

client.on('messageDelete', (message) => {
    if (message.guild != null) {
        if (message.content.startsWith("!")||message.author.bot) {
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
    if (msg.content.startsWith("!")) {
        CommandManager.onCommand(msg, client)
    }
});

module.exports = index;
