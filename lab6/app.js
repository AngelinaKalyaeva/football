const Agent = require ('./agent');  //Импорт агента
const VERSION = 7; //Версия сервера
let teamName =  "teamA"; //Имя команды
let playerType = "g";
let flag = "fc";
let x = 0;
let y = 0;

if (process.argv.length>=7) {
    teamName = process.argv[2];
    playerType = process.argv[3];
    flag = process.argv[4];
    x = process.argv[5];
    y = process.argv[6];
}

let agent = new Agent(teamName, playerType, flag, x, y);  //Создание экземпляра агента
require('./socket')(agent, teamName, VERSION);  //Настройка сокета
// agent.socketSend("move",`-25 -10`); //Размещение игрока на поле