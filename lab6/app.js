const Agent = require ('./agent');  //Импорт агента
const VERSION = 7; //Версия сервера
let teamName =  "teamA"; //Имя команды
let playerType = "g";
let flag = "fc";

if (process.argv.length>=5) {
    teamName = process.argv[2];
    playerType = process.argv[3];
    flag = process.argv[4];
}

let agent = new Agent(teamName, playerType, flag);  //Создание экземпляра агента
require('./socket')(agent, teamName, VERSION);  //Настройка сокета
// agent.socketSend("move",`-25 -10`); //Размещение игрока на поле