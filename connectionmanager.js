const connectionmanager = {};
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const YTPL = require("ytpl");
const YTSR = require("ytsr");
const FS = require("fs");
const Stream = require("stream");
const Util = require("util");
let connection = null;
let dispatcher = null;
let volume = 10;
let repeat = false;

let queue = [];

connectionmanager.joinChannel = async function(client, channel, msg) {
    await channel.join().then(voiceConnection => {
            connection = voiceConnection;
             msg.reply("Successfully joined your channel.");
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
    if (connection != null) {
        connection.disconnect();
    }
    connection = null;
    queue = [];
    if (dispatcher != null) {
        dispatcher.end();
    }
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
            for (let i = 0; i < playlist.items.length;i++) {
                let s = playlist.items[i];
                const song = {
                    title: s.title,
                    id: s.id,
                    url: s.url_simple,
                };
                queue.push(song);
            }

            if (queue.length === playlist.items.length) {
                await play(queue[0], client);
                msg.reply("Playlist " + playlist.title + " now playing with " + playlist.items.length + " total songs in the queue.");
                return;
            } else {
                msg.reply("Playlist " + playlist.title + " added to the queue with " + playlist.items.length + " songs added to the list.");
            }
        });
    } else if (await YTDL.validateURL(URL)) {
        if (connection == null) {
            await connectionmanager.joinChannel(client, msg.member.voiceChannel, msg);
        }
        const songInfo = await YTDL.getInfo(URL).catch((err) => {
            console.log(err);
        });
        const song = {
            title: songInfo.title,
            id: songInfo.video_id,
            url: songInfo.video_url,
        };
        queue.push(song);
        msg.reply("Song " + song.title + " added to the queue.");
        if (queue.length === 1) {
            play(song, client);
        }
    } else {
        let search = msg.content.replace("!play ","");
        YTSR(search, {limit: 1}, (err, searchResults) => {
           if (err) {
               msg.reply("Something went wrong when trying to search that term. Please try again.");
               return;
           }

           connectionmanager.playCommand(searchResults.items[0].link, msg, client)
        });
        await msg.reply("That is not a valid YouTube Playlist or Video URL.");
    }
};

async function play(song, client) {

    if (!song) {
        client.guilds.get("105235654727704576").channels.get("643571367715012638").send("Playback ended.");
        await client.user.setActivity("on the Cult of Cheese", {type: "PLAYING"});
        queue = [];
        return;
    }

    if (!FS.existsSync("musiccache/" + song.id + ".m4a")) {
		console.log("Downloading song " + song.id + " for the first time.");
		try {
            let dl = YTDL(song.url, {quality: "highestaudio", filter: "audioonly"});
            dl.pipe(FS.createWriteStream("musiccache/" + song.id + ".m4a"));
            dl.on('end', () => {
                console.log("Done.");
                play(song, client);
            });
            dl.on('error', (err) => {
                console.log("An error occured while trying to download a song. Skipping song. Error: " + err);
                queue.shift();
                play(queue[0],client);
                return;
            })
        } catch (err) {
            console.log("An error occured while trying to download a song. Skipping song. Error: " + err);
            queue.shift();
            play(queue[0],client);
		    return;
        }
		return;
    }

    if (queue.length > 1) {
        try {
            if (!FS.existsSync("musiccache/" + queue[1].id + ".m4a")) {
                console.log("Downloading the next song " + queue[1].id + " for the first time.");
                let dl = YTDL(queue[1].url, {quality: "highestaudio", filter: "audioonly"});
                dl.pipe(FS.createWriteStream("musiccache/" + queue[1].id + ".m4a"));
                dl.on('end', () => {
                    console.log("The next song has been downloaded and is ready to play.");
                });
                dl.on('error', (err) => {
                    console.log("An error occured while trying to download a song. Skipping song. Error: " + err);
                    let current = queue.shift();
                    queue.shift();
                    queue.unshift(current);
                })
            }
        } catch (err) {
            console.log("An error occured while trying to download a song. Skipping song. Error: " + err);
            let current = queue.shift();
            queue.shift();
            queue.unshift(current);
            play(queue[0],client);
            return;
        }
    }
	
	
	console.log("Playing " + song.title + " now.");
	client.guilds.get("105235654727704576").channels.get("643571367715012638").send(new Discord.RichEmbed().setTitle("Now Playing").setThumbnail("https://i.ytimg.com/vi/" + song.id + "/hqdefault.jpg").setDescription(song.title).setColor('#00AA00'));
	await client.user.setActivity("🎶 " + song.title + " 🎶", {type: "PLAYING"});
	
    dispatcher = connection.playFile(__dirname + "/musiccache/" + song.id + ".m4a")
        .on('end', () => {
            if (queue.length === 0) {
                play(false, client);
                return;
            }
            if (repeat) {
                queue.push(queue.shift());
            } else {
                queue.shift();
            }
            play(queue[0], client);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(volume / 10);
    dispatcher.setBitrate(128);
}

connectionmanager.skip = function(msg, client) {
    if (!msg.member.voiceChannel) {
        return msg.reply("You must be in the same channel as the bot in order to use music commands.")
    } else if (client.voiceChannel) {
        if (msg.member.voiceChannel.id !== client.voiceChannel.id) {
            return msg.reply("You must be in the same channel as the bot in order to use music commands.");
        }
    }
    if (queue.length === 0) return msg.reply('There is no song that I could skip!');
    msg.reply("Song skipped.");
    dispatcher.end();
};

connectionmanager.stop = async function (msg, client) {
    if (queue.length > 0) {
        queue = [];
        dispatcher.end();
        await msg.reply("Playback has stopped and the queue has been cleared.");
    } else {
        await msg.reply("You cannot stop playback as there is nothing playing.");
    }
};

connectionmanager.nowPlaying = function(msg) {
    if (queue.length > 0) {
        msg.reply("Now Playing: `" + queue[0].title + "`");
    } else {
        msg.reply("There is nothing currently playing.");
    }

};

connectionmanager.volume = function(msg, vl) {
    if (queue.length > 0 && dispatcher != null) {
        if (!dispatcher.destroyed) {
            dispatcher.setVolumeLogarithmic(vl / 10);
            msg.reply("You have set the volume to " + vl + ".");
            volume = vl;
        } else {
            volume = vl;
            msg.reply("You have set the volume to " + vl + ".")
        }
    } else {
        volume = vl;
        msg.reply("You have set the volume to " + vl + ".")
    }
};

connectionmanager.clearQueue = function(msg) {
    if (queue.length > 1) {
        let currentSong = queue[0];
        queue = [];
        queue.push(currentSong);
        msg.reply("The queue has been cleared.");
    } else {
        msg.reply("The queue is already empty.")
    }
};

connectionmanager.pause = function(msg) {
  if (queue.length > 0) {
      dispatcher.pause();
      msg.reply("Playback has been paused.");
  } else {
      msg.reply("There is nothing currently playing.");
  }
};

connectionmanager.resume = function(msg) {
    if (queue.length > 0) {
        dispatcher.resume();
        msg.reply("Playback has been resumed.");
    } else {
        msg.reply("There is nothing currently playing.");
    }
};

connectionmanager.repeat = function(msg) {
    if (repeat) {
        msg.reply("Repeat mode has been disabled.");
        repeat = false;
    } else {
        msg.reply("Repeat mode has been enabled.");
        repeat = true;
    }
};

connectionmanager.shuffle = function(msg) {
    msg.reply("The queue has been shuffled.");
    let currentSong = queue.shift();
    queue  = shuffle(queue);
    queue.unshift(currentSong);
};

function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}



module.exports = connectionmanager;