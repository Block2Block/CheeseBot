const connectionmanager = {};
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const YTPL = require("ytpl");
const YTSR = require("ytsr");
let connection = null;
let dispatcher = null;
let volume = 5;

let queue = [];

async function execute(message, serverQueue) {
    const args = message.content.split(' ');
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
    const permissions =     voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('I need the permissions to join and   speak in your voice channel!');
    }
}

connectionmanager.joinChannel = async function(client, channel, msg) {
    await channel.join().then(voiceConnection => {
            connection = voiceConnection;
             msg.reply("Successfully joined your channel.").then(message => {
                 setTimeout(async () => {
                    message.delete();
                 }, 5000)
             });
             msg.delete();
        }
    ).catch((error) =>{
        msg.reply("Unable to join your channel.");
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error has occurred when trying to join a voice channel. Error: " + error);
    });
};

connectionmanager.inChannel = function() {
    return new Promise(function(resolve, reject) {
        resolve(connection != null);
    });
};

connectionmanager.leave = function() {
    connection.disconnect();
    connection = null;
    queue = [];
    if (dispatcher != null) {
        dispatcher.end();
    }
    dispatcher = null;
};

connectionmanager.playCommand = async function (URL, msg, client) {
    if (!msg.member.voiceChannel) {
        return msg.reply("You must be in the same channel as the bot in order to use music commands.")
    } else if (client.voiceChannel) {
        if (msg.member.voiceChannel.id !== client.voiceChannel.id) {
            return msg.reply("You must be in the same channel as the bot in order to use music commands.");
        }
    }
    if (await YTPL.validateURL(URL)) {
        YTPL(URL, {limit: 0}, async function (err, playlist) {
            if (connection == null || !connection) {
                await connectionmanager.joinChannel(client, msg.member.voiceChannel, msg);
            }
            if (err) {
                msg.reply("An error occurred: " + err);
                return;
            }
            msg.reply("Playlist " + playlist.title + " added to the queue with " + playlist.items.length + " songs added to the list.").then(message => {
                setTimeout(async () => {
                    message.delete();
                }, 5000)
            });
            msg.delete();
            for (let i = 0; i < playlist.items.length;i++) {
                let s = playlist.items[i];
                const song = {
                    title: s.title,
                    thumbnail: s.thumbnail,
                    url: s.url_simple,
                };
                queue.push(song);
            }
            if (queue.length === playlist.items.length) {
                play(queue[0], client);
                return;
            }
        });
    } else if (await YTDL.validateURL(URL)) {
        if (connection == null) {
            connectionmanager.joinChannel(client, msg.member.voiceChannel, msg);
        }
        msg.delete();
        const songInfo = await YTDL.getInfo(URL);
        const song = {
            title: songInfo.title,
            thumbnail: songInfo.thumbnail_url,
            url: songInfo.video_url,
        };
        queue.push(song);
        msg.reply("Song " + song.title + " added to the queue.").then(message => {
            setTimeout(async () => {
                message.delete();
            }, 5000)
        });
        if (queue.length === 1) {
            play(song, client);
        }
    } else {
        msg.delete();
        await msg.reply("That is not a valid YouTube Playlist or Video URL.");
    }
};

async function play(song, client) {

    if (!song) {
        client.guilds.get("105235654727704576").channels.get("643571367715012638").send("Playback ended.");
        return;
    }

    client.guilds.get("105235654727704576").channels.get("643571367715012638").send(new Discord.RichEmbed().setTitle("Now Playing").setThumbnail(song.thumbnail).setDescription(song.title));

    dispatcher = connection.playStream(YTDL(song.url, {quality: "highestaudio",filter: 'audioonly'}))
        .on('end', () => {
            queue.shift();
            play(queue[0], client);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(volume / 5);
    dispatcher.setBitrate(96);
}

connectionmanager.skip = function(msg, client) {
    if (!msg.member.voiceChannel) {
        return msg.reply("You must be in the same channel as the bot in order to use music commands.")
    } else if (client.voiceChannel) {
        if (msg.member.voiceChannel.id !== client.voiceChannel.id) {
            return msg.reply("You must be in the same channel as the bot in order to use music commands.");
        }
    }
    if (queue.length === 0) return msg.reply('There is no song that I could skip!').then(message => {
        setTimeout(async () => {
            message.delete();
        }, 5000)
    });
    msg.delete();
    msg.reply("Song skipped.");
    dispatcher.end();
};

connectionmanager.stop = function(msg, client) {
    if (!msg.member.voiceChannel) {
        return msg.reply("You must be in the same channel as the bot in order to use music commands.")
    } else if (client.voiceChannel) {
        if (msg.member.voiceChannel.id !== client.voiceChannel.id) {
            return msg.reply("You must be in the same channel as the bot in order to use music commands.");
        }
    }
    queue = [];
    dispatcher.end();
    dispatcher = null;
};

connectionmanager.nowPlaying = function(msg) {
    msg.reply("Now Playing: `" + queue[0].title + "`");
};

module.exports = connectionmanager;