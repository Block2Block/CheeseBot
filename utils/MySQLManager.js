//Loading external libraries.
const mysql = require('mysql');

//Initialising module export.
const mySQLManager = {};

//Creating client.
let MySQLClient = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});


mySQLManager.connect = function(logger) {
    MySQLClient.on('acquire', function (connection) {
        logger.info('MySQL Connection Pool: Connection %d acquired', connection.threadId);
    });

    MySQLClient.on('release', function (connection) {
        logger.info('MySQL Connection Pool: Connection %d released', connection.threadId);
    });

    MySQLClient.query("CREATE TABLE IF NOT EXISTS `punishments` ( `id` INT NOT NULL AUTO_INCREMENT , `discord_id` TEXT NOT NULL , `punisher` TEXT NOT NULL , `type` INT NOT NULL , `reason` TEXT NOT NULL , `timestamp` TEXT NOT NULL , `expire` TEXT NOT NULL , `status` INT NOT NULL , `removal_reason` TEXT NULL DEFAULT NULL , `remover` TEXT NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = MyISAM;", function (err, result) {
        if (err) {
            logger.error(err);
        }
    })
};

mySQLManager.getPunishOnLoad = async function (callback, logger) {
    MySQLClient.query("SELECT *  FROM punishments WHERE status = 1", function (err, result) {
        if (err) {
            logger.error(err);
        }
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
            };
            punishments.push(punishment);
        }
        callback(punishments);
    })
};

mySQLManager.getPunishments = async function (user, callback, logger) {
    MySQLClient.query("SELECT * FROM punishments WHERE discord_id = '" + user + "'", function (err, result) {
        if (err) {
            logger.error(err)
        }
        let punishments = [];
        //For each record, create a punishment object.
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

mySQLManager.punish = async function (user, type, timestamp, expire, punisher, reason, status, callback, logger) {
    MySQLClient.query("INSERT INTO `punishments`(discord_id,punisher,type,reason,timestamp,expire,status) VALUES ('" + user + "','" + punisher + "'," + type + ",'" + reason + "','" + timestamp + "','" + expire + "',1)", function (err) {
        if (err) {
            logger.error(err)
        }
        MySQLClient.query("SELECT id FROM `punishments` WHERE (timestamp = '" + timestamp + "') AND (discord_id = '" + user + "')", function (err, result) {
            if (err) {
                logger.error(err)
            }
            callback(result[0].id);
        })
    })
};

mySQLManager.expire = async function (punishment_id, logger) {
    MySQLClient.query("UPDATE punishments SET status = 2, removal_reason = 'Expired' WHERE id = " + punishment_id, function (err) {
        if (err) {
            logger.error(err)
        }
    });
};

mySQLManager.removePunishment = async function (user, type, reason, remover, logger) {
    MySQLClient.query("UPDATE punishments SET status = 3, removal_reason = '" + reason + "', remover = '" + remover.tag + "' WHERE discord_id = " + user + " AND type = " + type, function (err) {
        if (err) {
            logger.error(err)
        }
    });
    return true;
};


module.exports = mySQLManager;