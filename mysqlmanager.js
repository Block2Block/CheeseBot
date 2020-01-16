const mysql = require('mysql');
const MySQLClient = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.BOT_DATABASE
});

function handleDisconnect() {// Recreate the connection, since
    // the old one cannot be reused.

    MySQLClient.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    MySQLClient.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();
const mysqlmanager = {};

mysqlmanager.getPunishOnLoad = async function (callback) {
    MySQLClient.query("SELECT *  FROM punishments WHERE status = 1", function (err, result, fields) {
        if (err) throw err;
        let punishments = [];
        for (let x of result) {
            let punishment = {
                id: x.id,
                user: x.discord_id,
                discord_id: x.discord_id,
                type: x.type,
                timestamp: x.timestamp,
                expire: x.expire,
                punisher: x.punisher,
                reason: x.reason,
                timer: null,
                status: x.status,
                removal_reason: x.removal_reason,
            };
            punishments.push(punishment);
        }
        callback(punishments);
    })
};

mysqlmanager.getPunishments = async function (user, callback) {
    MySQLClient.query("SELECT * FROM punishments WHERE discord_id = '" + user + "'", function (err, result, fields) {
        if (err) throw err;
        let punishments = [];
        for (let x of result) {
            let punishment = {
                id: x.id,
                user: x.discord_id,
                type: x.type,
                timestamp: x.timestamp,
                expire: x.expire,
                punisher: x.punisher,
                reason: x.reason,
                timer: null,
                status: x.status,
                removal_reason: x.removal_reason,
                remover: x.remover
            };
            punishments.push(punishment);
        }

        callback(punishments);
    });
};

mysqlmanager.punish = async function (user, type, timestamp, expire, punisher, reason, status, callback) {
    MySQLClient.query("INSERT INTO `punishments`(discord_id,punisher,type,reason,timestamp,expire,status) VALUES ('" + user + "','" + punisher + "'," + type + ",'" + reason + "','" + timestamp + "','" + expire + "',1)", function (err, result, fields) {
        if (err) throw err;
        MySQLClient.query("SELECT id FROM `punishments` WHERE (timestamp = '" + timestamp + "') AND (discord_id = '" + user + "')", function (err, result, fields) {
            if (err) throw err;
            callback(result[0].id);
        })
    })
};

mysqlmanager.expire = async function (user, punishment_id) {
    MySQLClient.query("UPDATE punishments SET status = 2, removal_reason = 'Expired' WHERE id = " + punishment_id, function (err, result, fields) {
        if (err) throw err;
    });
};

mysqlmanager.removePunishment = async function (punishment_id, reason, remover) {
    MySQLClient.query("UPDATE punishments SET status = 3, removal_reason = '" + reason + "', remover = '" + remover.tag + "' WHERE id = " + punishment_id, function (err, result, fields) {
        if (err) throw err;
    });
    return true;
};

mysqlmanager.removeBan = async function (user, reason, remover) {
    MySQLClient.query("SELECT id FROM punishments  WHERE discord_id = '" + user + "' AND status = 1 AND type = 2", function (err, result, fields) {
        if (err) throw err;
        mysqlmanager.removePunishment(result.id, reason, remover)
    });
};


module.exports = mysqlmanager;