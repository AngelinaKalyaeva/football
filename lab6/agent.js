const Msg = require('./msg');  //Подключение модуля разбора сообщений от сервера
const readline = require('readline'); //Подключение модуля ввода из командной строки
const ctrlLowGoalie = require('./ctrl_low_goalie');
const ctrlMediumGoalie = require("./ctrl_middle_goalie");
const ctrlHighGoalie = require("./ctrl_high_goalie");
const ctrlLowHB = require('./ctrl_low_halfback');
const ctrlMediumHB = require("./ctrl_middle_halfback");
const ctrlHighHB = require("./ctrl_high_halfback");
const ctrlLowCB = require('./ctrl_low_centerback');
const ctrlMediumCB = require("./ctrl_middle_centerback");
const ctrlHighCB = require("./ctrl_high_centerback");
const ctrlLowKicker = require('./ctrl_low_kicker');
const ctrlMediumKicker = require("./ctrl_middle_kicker");
const ctrlHighKicker = require("./ctrl_high_kicker");

class Agent {
    constructor(teamName, playerType, flag) {
        this.position = "l"; //По умолчанию - левая половина поля
        this.run = false; //Игра начата
        this.isMoved = false;
        this.turnSpeed = -5;
        this.coord = {x: 0, y: 0};
        this.isLock = false;
        this.angle = 0;
        this.speed = 0;
        this.playerType = playerType;
        this.teamName = teamName;
        this.flag = flag;
        this.act = null; //Действия

        this.rl = readline.createInterface({  //Чтение консоли
            input: process.stdin,
            output: process.stdout
        });
        this.rl.on('line', (input) => {//Обработка строки из консоли
            if (!this.run && !this.isMoved) {
                var coords = input.split(" ");

                if (isNaN(coords[0]) || isNaN(coords[1])) {
                    console.log("Неверный формат параметров.");
                    return;
                }

                var x = parseInt(coords[0]);
                var y = parseInt(coords[1]);

                this.isMoved = true;
                this.socketSend("move", x + " " + y);

                console.log("Стартовые параметры заданы x: %s, y: %s", x, y);
            }

        })
    }

    msgGot(msg) { //Получение сообещения
        let data = msg.toString('utf8'); //Приведение к строке
        this.processMsg(data); //Разбор сообщения
    }

    setSocket(socket) { //Настройка сокета
        this.socket = socket;
    }

    socketSend(cmd, value) { //Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`);
    }

    processMsg(msg) {  //Обработка сообщения
        let data = Msg.parseMsg(msg); //Разбор сообщения
        if (!data) throw new Error("Parse error \n" + msg);
        //Первое (hear) - начало игры
        if (data.cmd === "hear" && data.msg.includes("play_on")) {
            this.run = true;
        }

        if (data.cmd === "hear" && data.msg.includes("goal")) {
            this.run = false;
        }

        if (data.cmd === "init") this.initAgent(data.p); //Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p); //Обработка
    }

    initAgent(p) {
        if (p[0] === "r") this.position = "r"; //Правая половина поля
        if (p[1]) this.id = p[1]; //id игрока

        ctrlLowGoalie.side = this.position;
        ctrlLowGoalie.team = this.teamName;

        ctrlMediumGoalie.side = this.position;
        ctrlMediumGoalie.team = this.teamName;

        ctrlHighGoalie.side = this.position;
        ctrlHighGoalie.team = this.teamName;

        ctrlLowHB.side = this.position;
        ctrlLowHB.team = this.teamName;

        ctrlMediumHB.side = this.position;
        ctrlMediumHB.team = this.teamName;

        ctrlHighCB.side = this.position;
        ctrlHighCB.team = this.teamName;

        ctrlLowCB.side = this.position;
        ctrlLowCB.team = this.teamName;

        ctrlMediumCB.side = this.position;
        ctrlMediumCB.team = this.teamName;

        ctrlHighCB.side = this.position;
        ctrlHighCB.team = this.teamName;

        ctrlHighCB.side = this.position;
        ctrlHighCB.team = this.teamName;

        ctrlLowKicker.side = this.position;
        ctrlLowKicker.team = this.teamName;

        ctrlMediumKicker.side = this.position;
        ctrlMediumKicker.team = this.teamName;

        ctrlHighKicker.side = this.position;
        ctrlHighKicker.team = this.teamName;
    }


    analyzeEnv(msg, cmd, p) {  //Анализ сообщения
        if (cmd === "see" && this.run && this.isMoved) {
            if (this.playerType === "g") {
                var action = ctrlLowGoalie.execute(p, [ctrlMediumGoalie, ctrlHighGoalie]);
                if (action !== undefined) {
                    this.socketSend(action.n, action.v);
                }
            } else if (this.playerType === "hb") {
                var action = ctrlLowHB.execute(p, this.flag, [ctrlMediumHB, ctrlHighHB]);
                if (action !== undefined) {
                    this.socketSend(action.n, action.v);
                }
            } else if (this.playerType === "cb") {
                var action = ctrlLowCB.execute(p, this.flag, [ctrlMediumCB, ctrlHighCB]);
                if (action !== undefined) {
                    this.socketSend(action.n, action.v);
                }
            } else if (this.playerType === "k") {
                var action = ctrlLowKicker.execute(p, this.flag, [ctrlMediumKicker, ctrlHighKicker]);
                if (action !== undefined) {
                    this.socketSend(action.n, action.v);
                }
            }
        }
    }
}

module.exports = Agent; //Экспорт агента

