module.exports = {
    cmd: "welcomemessage",
    arguments: "welcomemessage",
    aliases: ["welcome"],
    desc: "Sends you a PM of the welcome message.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    allow_in_dm: true,
    run: async function(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger) {
        let Discord = require("discord.js");
        //Welcome message.
        msg.author.createDM().then(dmchannel => {
            dmchannel.send(new Discord.MessageEmbed()
                .setAuthor("The Cult of Cheese", "https://cdn.discordapp.com/icons/105235654727704576/a_61af5bec8e032bc50c9e32508b7cb63f.png")
                .setTitle("Welcome!")
                .setDescription("Welcome to the Cult of Cheese! We hope you enjoy your time here! Please read <#432279936490012672> fully before you get started. After you've done that and followed the instructions, you can do !help in <#439114503171604480> to get started!\n" +
                    "\n" +
                    "🧀 EMBRACE THE POWER OF THE CHEESE 🧀")
                .setColor('#FFAB00'));
        }).catch((reason) => {
            logger.warn("Login Promise Rejection: " + reason);
        });
    }
};