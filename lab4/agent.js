const Msg = require('./msg');  //Подключение модуля разбора сообщений от сервера
const readline = require('readline'); //Подключение модуля ввода из командной строки
const dtPass = require('./dt_pass'); //Подключение модуля дерева решений для двух игроков
const dtKicker = require('./dt_kicker'); //Подключение модуля дерева решений для двух игроков

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

        this.mgr = {
            getAction(dt, p) {
                dtPass.commandManager.p = p;
                dtKicker.commandManager.p = p;
                function execute(dt, title) {
                    const action = dt[title];
                    if (typeof action.exec == "function") {
                        action.exec(dt.state);
                        return execute(dt, action.next)
                    }
                    if (typeof action.condition == "function") {
                        const cond = action.condition(dt.state);
                        if (cond) {
                            return execute(dt, action.trueCond);
                        } else {
                            return execute(dt, action.falseCond);
                        }
                    }
                    if (typeof action.command == "function") {
                        return action.command(dt.state)
                    }
                    throw new Error(`Unexpected node in DT: ${title}`)
                }

                return execute(dt, "root")
            }
        };
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

        if (data.cmd === "hear" && data.msg.includes("go")) {
            dtKicker.DT_FLAGS.state.isGo = true;
        }

        if (data.cmd === "hear" && data.msg.includes("goal")) {
            dtPass.DT_FLAGS.state.isWait = false;
            dtPass.DT_FLAGS.state.next = 0;
            dtPass.DT_FLAGS.state.command = null;

            dtKicker.DT_FLAGS.state.isGo = false;
            dtKicker.DT_FLAGS.state.next = 0;
            dtPass.DT_FLAGS.state.command = null;

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
            if (this.playerType === "p") {
                var action = this.mgr.getAction(dtPass.DT_FLAGS, p);

                if (action.n === "say") {
                    this.run = false;
                }

                this.socketSend(action.n, action.v);
            } else if (this.playerType === "k") {
                action = this.mgr.getAction(dtKicker.DT_FLAGS, p);
                this.socketSend(action.n, action.v);
            }
        }
    }
}

module.exports = Agent; //Экспорт агента

