const Msg = require('./msg');  //Подключение модуля разбора сообщений от сервера
const readline = require('readline'); //Подключение модуля ввода из командной строки

const Flags = {
    ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
    ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
    ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
    ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
    ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
    ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
    fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
    fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
    fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
    fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
    fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
    flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
    flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
    flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
    flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
    fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
    gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
    flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
    fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
    distance(p1, p2) {
        return Math.sqrt((Math.abs(p1.x)-Math.abs(p2.x))**2+(Math.abs(p1.y)-Math.abs(p2.y))**2)
    },
};

class Agent{
    constructor(){
        this.position = "l"; //По умолчанию - левая половина поля
        this.run = false; //Игра начата
        this.isMoved = false;
        this.turnSpeed = -5;
        this.coord = {x:0, y:0};
        this.isLock = false;
        this.angle = 0;
        this.speed = 0;
        this.act = null; //Действия
        this.controller = { //Список действий, которые должен выполнить агент
            acts: [
                {act: "flag", fl: "fplt"},
                {act: "flag", fl: "fcb"},
                {act: "kick", fl: "b", goal: "gr"}
            ],
            currentAct: 0,
            processing(agent, flags, p) {
                let controllerStep = this.acts[this.currentAct];
                if (controllerStep.act === "flag") {
                    var flagNumber = agent.checkThatWeSeeFlag(flags, controllerStep.fl);
                    if (flagNumber === -1
                        ||  (Math.abs(flags[flagNumber].direction) >= 1)
                    ) {
                        if (flagNumber !== -1) {
                            if (flags[flagNumber].direction > 0) {
                                agent.turnSpeed = 5;
                            } else {
                                agent.turnSpeed = -5;
                            }
                            agent.socketSend("turn", flags[flagNumber].direction);
                        } else {
                            agent.socketSend("turn", agent.turnSpeed)
                        }
                    } else {
                        if (flags[flagNumber].distance <= 3.0) {
                            agent.socketSend("dash", `0`);
                            agent.controller.currentAct++;
                        } else {
                            agent.socketSend("dash", `80`);
                        }
                    }
                } else if (controllerStep.act === "kick") {
                    var seeBall = agent.getSeeBall(p);
                    if (seeBall == null) {
                        agent.socketSend("turn", agent.turnSpeed);
                        return;
                    }

                    if (Math.abs(seeBall.direction) >= 1) {
                        agent.socketSend("turn", seeBall.direction);
                        return;
                    }

                    if (Math.abs(seeBall.distance) >= 0.5) {
                        agent.speed = 80;
                        agent.socketSend("dash", agent.speed);
                        return;
                    } else {
                        if (agent.speed > 0) {
                            agent.speed = 0;
                            agent.socketSend("dash", agent.speed);
                            return;
                        }

                    }

                    flagNumber = agent.checkThatWeSeeFlag(flags, controllerStep.goal);
                    if (flagNumber !== -1) {
                        agent.socketSend("kick", `100 ` + flags[flagNumber].direction);
                    } else {
                        agent.socketSend("kick", `10 45`);
                    }
                }
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

                this.coord = {x: x, y:y};
                this.isMoved = true;
                this.socketSend("move", x + " " + y);

                console.log("Стартовые параметры заданы x: %s, y: %s", x, y);
            }

            if(this.run) { //Если игра начата
                if (this.isMoved) {
                // TODO
                }
            }
        })
    }
    msgGot(msg){ //Получение сообещения
        let data = msg.toString('utf8'); //Приведение к строке
        this.processMsg(data); //Разбор сообщения
        this.sendCmd(); //Отправка команды
    }

    setSocket(socket) { //Настройка сокета
        this.socket = socket;
    }

    socketSend(cmd, value){ //Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`);
    }

    processMsg(msg){  //Обработка сообщения
        let data = Msg.parseMsg(msg); //Разбор сообщения
        if(!data) throw new Error ("Parse error \n" + msg);
        //Первое (hear) - начало игры
        if(data.cmd === "hear" && data.msg.includes("play_on")) this.run = true;
        if (data.cmd === "hear" && data.msg.includes("goal")) {
            this.controller.currentAct = 0;
            this.run = false;
        }
        if(data.cmd === "init") this.initAgent(data.p); //Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p); //Обработка
    }
    initAgent(p){
        if(p[0] === "r") this.position = "r"; //Правая половина поля
        if(p[1]) this.id = p[1]; //id игрока
    }
    analyzeEnv(msg, cmd, p){  //Анализ сообщения (TODO)
        if (cmd === "see" && this.run && this.isMoved) {
            let flags = this.getAllSeeFlags(p);
            this.controller.processing(this, flags, p);
        }
    }

    //lab1
    getCoords(flags) {
        // var myCoords = this.getCoords(flags);
        //
        // if (myCoords != null) {
        //     this.coord = myCoords;
        // }
        //
        // if (this.coord == null && ((this.isLock === false && myCoords == null)
        //     || (this.isLock === true))) {
        //     this.socketSend("turn", 10);
        //     this.angle += 10;
        //     this.isLock = true;
        //     return;
        // }
        //
        // if (this.isLock === true && this.coord != null) {
        //     this.socketSend("turn", -this.angle);
        //     this.angle = 0;
        //     this.isLock = false;
        //     return;
        // }

        if (flags.length < 3) {
            return null;
        }

        var x1 = Flags[flags[0].flag].x;
        var y1 = Flags[flags[0].flag].y;
        var d1 = flags[0].distance;

        var x2;
        var y2;
        var d2;

        var x3;
        var y3;
        var d3;

        var i = 0;
        var flag = false;
        while (i < (flags.length - 1)) {
            ++i;
            if (Flags[flags[i].flag].x !== x1 && Flags[flags[i].flag].y !== y1) {
                flag = true;
                break;
            }
        }

        if (!flag) {
            return null;
        }

        x2 = Flags[flags[i].flag].x;
        y2 = Flags[flags[i].flag].y;
        d2 = flags[i].distance;

        flag = false;
        while (i < (flags.length - 1)) {
            ++i;
            if (Flags[flags[i].flag].x !== x1 && Flags[flags[i].flag].y !== y1) {
                flag = true;
                break;
            }
        }

        if (!flag) {
            return null;
        }

        x3 = Flags[flags[i].flag].x;
        y3 = Flags[flags[i].flag].y;
        d3 = flags[i].distance;

        var alpha1 = (y1 - y2) / (x2 - x1);
        var beta1 = (y2 ** 2 - y1 ** 2 + x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1));

        var alpha2 = (y1 - y3) / (x3 - x1);
        var beta2 = (y3 ** 2 - y1 ** 2 + x3 ** 2 - x1 ** 2 + d1 ** 2 - d3 ** 2) / (2 * (x3 - x1));

        var y = (beta2 - beta1) / (alpha2 - alpha1);
        var x = alpha1 * ((beta1 - beta2) / (alpha2 - alpha1)) + beta1;

        return {x: x, y: y};
    }

    getSeeBall(p) {
        for (let i = 1; i < p.length; ++i) {
            if (p[i].cmd.p.length >= 0 &&
                p[i].cmd.p[0] === "b" &&
                p[i].p.length >= 2
            ) {
                return {distance: p[i].p[0], direction: p[i].p[1]};
            }
        }
        return null;
    }

    getAllSeeFlags(p) {
        let flags = [];
        for (let i = 1; i < p.length; ++i) {
            if (p[i].cmd.p.length >= 0 &&
                (p[i].cmd.p[0] === "f" || p[i].cmd.p.join("") === "gr" || p[i].cmd.p.join("") === "gr") &&
                p[i].p.length >= 2
            ) {
                flags.push({distance: p[i].p[0], direction: p[i].p[1], flag: p[i].cmd.p.join("")});
            }
        }

        return flags;
    }

    checkThatWeSeeFlag(flags, flagName) {
        for (let i = 0; i < flags.length; ++i) {
            if (flags[i].flag === flagName) {
                return i;
            }
        }

        return -1;
    }

    sendCmd(){
        if(this.run){ //Игра начата
            // this.socketSend("turn", this.turnSpeed);

            if(this.act){  //Есть команда от игрока
            // TODO
            }

            this.act = null;
        }
    }
}
module.exports = Agent; //Экспорт агента

