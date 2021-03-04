const Agent = require ('./agent');  //Импорт агента
const VERSION = 7; //Версия сервера
let teamName =  "teamA"; //Имя команды
let isGoalie = false;
if (process.argv.length>=3) {
    if (process.argv[2] === "g") {
        isGoalie = true;
        teamName = "goalieTeam";
    }
}
let agent = new Agent(isGoalie);  //Создание экземпляра агента
require('./socket')(agent, teamName, VERSION);  //Настройка сокета
// agent.socketSend("move",`-25 -10`); //Размещение игрока на поле