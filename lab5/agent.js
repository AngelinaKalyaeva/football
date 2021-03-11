const Msg = require('./msg');  //Подключение модуля разбора сообщений от сервера
const readline = require('readline'); //Подключение модуля ввода из командной строки
const taGoalie = require('./ta_golie');
const taKicker = require('./ta_kicker');
const taManager = require('./ta_manager');

class Agent {
    constructor(playerType) {
        this.position = "l"; //По умолчанию - левая половина поля
        this.run = false; //Игра начата
        this.isMoved = false;
        this.turnSpeed = -5;
        this.coord = {x: 0, y: 0};
        this.isLock = false;
        this.angle = 0;
        this.speed = 0;
        this.playerType = playerType;
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

                if (this.playerType === "g") {
                    this.teamName = "goalieTeam";
                } else {
                    this.teamName = "teamA";
                }

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
    }


    analyzeEnv(msg, cmd, p) {  //Анализ сообщения
        if (cmd === "see" && this.run && this.isMoved) {
            if (this.playerType === "g") {
                var action = taManager.getAction(p, taGoalie.TA, this.teamName, this.position, false);
                if (action !== undefined) {
                    this.socketSend(action.n, action.v);
                }
            } else {
                var action = taManager.getAction(p, taKicker.TA, this.teamName, this.position, false);
                if (action !== undefined) {
                    this.socketSend(action.n, action.v);
                }
            }
        }
    }
}

module.exports = Agent; //Экспорт агента

