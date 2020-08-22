const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const botToken = config.botToken;

client.login(botToken);

var mysql = require('mysql');

const DB_HOST = config.dbConnection.DB_HOST;
const DB_USERNAME = config.dbConnection.DB_USERNAME;
const DB_PASSWORD = config.dbConnection.DB_PASSWORD;
const DB_NAME = config.dbConnection.DB_NAME;

var con = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME
});

client.once('ready', () => {
	console.log('Ready!');

    var cappedChannel = client.channels.cache.get("479949169092591626");

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        setInterval(function() {
            getCappedUsers(con, cappedChannel);
        }, 1*60*1000);
        getCappedUsers(con, cappedChannel);
    });
});

var commandDetails = [
    ['Ping', 'Replies "Pong."'],
    ['Help', 'Lists all commands.']
];

var botFunctions = [
    'I also receive clan citadel capping notifications from alt1 and post them.'
]

function getCappedUsers(con, channel) {
    let query = "SELECT * FROM `citadel_capping` WHERE state = 1 LIMIT 1;"
    con.query(query, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            var completeQuery = "UPDATE `citadel_capping` SET `state`=2 WHERE id = "+result[0].id+";";
            channel.send(result[0].username + " has capped at the citadel.")
                .then(message => con.query(completeQuery, function(err, result2) {
                    if (err) throw err;
                }));
        }
    });
}

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.substring(0, 1) === '&') {
		var args = message.content.substring(1).split(' ');
		var cmd = args[0].toLowerCase();
		args = args.splice(1);
		var msg = args.join();
		console.log(cmd);
        switch (cmd) {
            case 'ping':
                cmdPing(message);
                break;
            case 'help':
                cmdHelp(message);
                break;
            default:
                customMessage(message, "That command doesn't exist.\nTry !help.");
                break;
        }
    }
});

function customMessage(message, text, emoji = false) {
    message.channel.send(text).then(sentMessage => {
		if (emoji) {
			sentMessage.react(emoji);
		}
	});
}

function cmdHelp(message) {
    let helpMessage = '';
    commandDetails.forEach(element => helpMessage += '"&' + element[0] + '": ' + element[1] + '\n');
    botFunctions.forEach(element => helpMessage += element + '\n');
    helpMessage = helpMessage.slice(0,-1);
    customMessage(message, helpMessage);
}

function cmdPing(message) {
    // send back "Pong." to the channel the message was sent in
    customMessage(message, 'Pong.');
}
