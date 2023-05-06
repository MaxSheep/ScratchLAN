/*

	Rzye Tello

	Scratch Ext 1.0.0.1

	http://www.ryzerobotics.com

	4/7/2018
*/

var osdData = {};

var http = require('http');
var fs = require('fs');
var url = require('url');


var PORT = 8889;
var HOST = '192.168.56.1';

var PORT2 = 8890;
var HOST2 = '0.0.0.0';

var localPort = 50602;

// var PORT2 = 41235;
// var HOST2 = '127.0.0.1';

var blockCmd = ['emergency', 'rc']  // 阻塞指令
var notBlockCmd = []            // 非阻塞，遇到直接执行下一个指令

var dgram = require('dgram');
const client = dgram.createSocket('udp4');
client.bind(localPort);
const server = dgram.createSocket('udp4');

// 维护一个命令数组
let order = []
// 正在执行等待cmd，则锁住
let lock = false

let sendMethod = function (cmd) {
    var message = new Buffer(cmd);
    console.log('send:', cmd)
    client.send(message, 0, message.length, PORT, HOST, function (err, bytes) {
        if (err) {
            console.log('连接出错', err)
            throw err;
        }
    });
}
let carryCMD = function () {
    if (order.length) {
        let cmd = order[0]
        sendMethod(cmd)
    }
}

client.on('message', function (msg, info) {
    if (msg.toString() === 'ok') {
        console.log('Data received from server : ' + msg.toString());
        console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port);
        if (order.length) {
            order = order.splice(1)
        }
        carryCMD()
    } else {
        // 不是ok的话，清空数组重新执行
        console.log('not ok', msg.toString())
        order = [];
    }
});

let sendCmd = function (cmd) {
    if (notBlockCmd.indexOf(cmd) >= 0) {
        return
    }
    if (blockCmd.indexOf(cmd) >= 0) {
        sendMethod(cmd);
        order = [];
        return false;
    }
    order.push(cmd);
    !lock && carryCMD(); // 每次触发sendCmd时候， 触发执行
};

// 监听本机server
let listenState = function () {
    server.on('message', (msg, rinfo) => {
        msg = msg.toString().trim();
        // console.log('Received 8890', msg)
        let fieldList = msg.split(';');
        fieldList.forEach(function (field) {
            let [key, value] = field.split(':');
            osdData[key] = value;
        })
        // console.log('fieldList', fieldList)
        // console.log('osdData', osdData)
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(PORT2, HOST2);
};

// 发送command到tello
let msgCommand = new Buffer('command');
client.send(msgCommand, 0, msgCommand.length, PORT, HOST, (err) => {
    if (err) {
        console.log('连接出错，连接关闭', err)
        client.close();
    }
});

console.log('---------------------------------------');
console.log('Tello Scratch Ext running at http://127.0.0.1:8001/');
console.log('---------------------------------------');

http.createServer(function (request, response) {
    let url_params = request.url.split('/');
    if (url_params.length < 2) return;

    let command = url_params[1];
    if (command == 'poll') {
        let rst = '';
        for (let k in osdData) {
            rst += `${k} ${osdData[k]}\n`;
        }
        response.end(rst);
        return;
    } else if (command == 'takeoff') {
        sendCmd('command');
        sendCmd('takeoff');
    } else {
        let cmd = url_params.slice(1).join(' ');
        sendCmd(cmd);
    }

    response.end('Hello Tello.\n');

}).listen(8001);
process.on('SIGINT', function () {
    order = [];
    client.close()
    server.close()
    console.log('Goodbye !');
    process.exit();
})
listenState();
