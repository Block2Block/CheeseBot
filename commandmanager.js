const commandmanager = {};
const Discord = require("discord.js");
const MySQLManager = require("./mysqlmanager.js");

commandmanager.onCommand = function(msg, client) {
    if (msg.guild == null) {
        if (!client.guilds.get("105235654727704576").members.keyArray().includes(msg.author.id)) {
            msg.channel.send("You are not a part of The Cult of Cheese Discord. You must be a part of the Discord in order to use this bot. Please join here: http://discord.gg/vmT6wY7/");
            return;
        } else {
            msg.channel.send("You cannot send messages via PM to this bot. Please use #bot-commands.")
        }
    } else {
        if (msg.content.startsWith("!unlink")) {


        } else if (msg.content.startsWith("!invite")) {

        } else if (msg.content.startsWith("!p")||msg.content.startsWith("!punish")) {

        }
    }


};

module.exports = commandmanager;