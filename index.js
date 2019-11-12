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
