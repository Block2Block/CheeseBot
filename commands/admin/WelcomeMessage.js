module.exports = {
    cmd: "welcomemessage",
    arguments: "welcomemessage",
    aliases: ["welcome"],
    desc: "Sends you a PM of the welcome message.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args) {
        msg.member.createDM().then(dmchannel => {
            dmchannel.send(new Discord.RichEmbed()
                .setAuthor("The Cult of Cheese", "https://cdn.discordapp.com/icons/105235654727704576/a_6ac123436074fea65da6264340302245.png")
                .setTitle("Welcome!")
                .setDescription("Welcome to the Cult of Cheese! We hope you enjoy your time here! Please read #rules carefully, as interacting in any capacity in this Discord Server is taken as confirmation that you are going to abide by and agree with our rules. After you've done that, you can do !help in #bot-utils to get started!\n" +
                    "\n" +
                    "🧀 EMBRACE THE POWER OF THE CHEESE 🧀")
                .setColor('#FFAB00'));
        }).catch((reason) => {
            console.log("Login Promise Rejection: " + reason);
        });
    }
};