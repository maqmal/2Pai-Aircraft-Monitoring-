const serialPort = require('serialport');
const portNumber = "COM10";// situasional, lihat port di device manager
const baudPort = new serialPort(portNumber ,{baudRate:57600});

console.log("Port Number : "+portNumber);
// parser agar tidak buffer
const parsers = serialPort.parsers;
const parser = new parsers.Readline({
    delimiter: '\r\n'
})
baudPort.pipe(parser);

// akses data yang masuk node js
baudPort.on('open', ()=>{
    console.log('Connected at : '+portNumber);
    let timeOut = 3000; // 3 detik

    setTimeout(()=>{
    // kirim command 1 ke arduino
    baudPort.write('1',(err)=>{
        if (err){
            console.log(err);
        }else {
            console.log('Node connected');
        }
    });
    },timeOut); 
});

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');

app.use(express.static(path.join(__dirname,'www')));
const portListen = 8080;
server.listen(portListen);

//buat socket event
let clientCount = 0;
io.on('connection',(socket)=>{
    clientCount++;
    console.log('New client connected '+clientCount);
    parser.on('data',(data)=>{
        let hasilParsing = parsingRawData(data," ");
        socket.emit('socketData',{dataHasil : hasilParsing});
        console.log(data);
    });
})

/**
 * 
 * @param {String} data 
 * @returns
 *  [<latitude>, <longitude>, <humidity>, <temperature>, <acc_x>, <acc_x>, <acc_x>, <gyro_x>, <gyro_y>, <gyro_z>]
 * "Parsing untuk intern payload"
 */
function parsingRawData (data) {
	const regex = /([0-9|\.|-]*)/g;
	let hasilParsing = [];
		data.match(regex).forEach(element => {
			if (element != '')
				hasilParsing.push(element);
		});
        return hasilParsing;
    }


// Real-time cuaca
const request = require('request');
const argv = require('yargs').argv;
let apiKey = '9697e661a188cb4621c5a52a23ca3907';
let city = argv.c || 'Bandung';
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

request(url, function (err, response, body) {
    if (err) {
        console.log('error:', error);
    } else {
        let weather = JSON.parse(body)
        let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        console.log(message);
    }
});