const Agent = require ('./agent');  //Импорт агента
const VERSION = 7; //Версия сервера
let teamName =  "teamA"; //Имя команды
let playerType = "k";
if (process.argv.length>=3) {
    playerType = process.argv[2];
    if (process.argv[2] === "g") {
        teamName = "goalieTeam";
    }
}
let agent = new Agent(playerType);  //Создание экземпляра агента
require('./socket')(agent, teamName, VERSION);  //Настройка сокета
