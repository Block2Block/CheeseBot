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

const finished = Util.promisify(Stream.finished);

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
            msg.reply("Playlist " + playlist.title + " added to the queue with " + playlist.items.length + " songs added to the list.");
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
                play(queue[0], client);
                return;
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
        await msg.reply("That is not a valid YouTube Playlist or Video URL.");
    }
};

async function play(song, client) {

    if (!song) {
        client.guilds.get("105235654727704576").channels.get("643571367715012638").send("Playback ended.");
        return;
    }

    if (!FS.existsSync("musiccache/" + song.id + ".m4a")) {
		console.log("Downloading song " + song.id + " for the first time.");
		let dl = YTDL(song.url, {quality: "highestaudio", filter: "audioonly"});
		dl.pipe(FS.createWriteStream("musiccache/" + song.id + ".m4a"));
		dl.on('end', () => {
			console.log("Done.");
			play(song, client);
		});
		return;
    }

    if (queue.length > 1) {
        if (!FS.existsSync("musiccache/" + queue[1].id + ".m4a")) {
            console.log("Downloading next song " + queue[1].id + " for the first time.");
            let dl = YTDL(song.url, {quality: "highestaudio", filter: "audioonly"});
            dl.pipe(FS.createWriteStream("musiccache/" + song.id + ".m4a"));
            dl.on('end', () => {
                console.log("Done.");
            });
        }
    }
	
	
	console.log("Playing " + song.title + " now.");
	client.guilds.get("105235654727704576").channels.get("643571367715012638").send(new Discord.RichEmbed().setTitle("Now Playing").setThumbnail("https://i.ytimg.com/vi/" + song.id + "/hqdefault.jpg").setDescription(song.title).setColor('#00AA00'));
	
    dispatcher = connection.playFile(__dirname + "/musiccache/" + song.id + ".m4a")
        .on('end', () => {
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
    if (queue.length === 0) return msg.reply('There is no song that I could skip!');
    msg.reply("Song skipped.");
    dispatcher.end();
};

connectionmanager.stop = function(msg, client) {
    if (queue.length > 0) {
        queue = [];
        dispatcher.end();
        dispatcher = null;
        msg.reply("Playback has stopped and the queue has been cleared.");
    } else {
        msg.reply("You cannot stop playback as there is nothing playing.");
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
    if (queue.length > 0) {
        dispatcher.setVolumeLogarithmic(vl / 10);
        msg.reply("You have set the volume to " + vl + ".");
        volume = vl;
    } else {

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
      //dispatcher.pause();
      msg.reply("This functionality is temporarily disabled.");
  } else {
      msg.reply("There is nothing currently playing.");
  }
};

connectionmanager.resume = function(msg) {
    if (queue.length > 0) {
        //dispatcher.resume();
        msg.reply("This functionality is temporarily disabled.");
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