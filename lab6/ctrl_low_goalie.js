const Taken = require('./taken');

const CTRL_LOW_GOALIE = {
    execute(input, controllers) {
        const next = controllers[0]; // Следующий уровень

        Taken.setSee(input, this.team, this.side);
        this.takenState = Taken.state; // Выделение объектов

        this.takenState.canKick = this.takenState.ball && this.takenState.ball.dist < 0.5;
        if(next) { // Вызов следующего уровня
            return next.execute(this.takenState, controllers.slice(1))
        }
    }
};

module.exports = CTRL_LOW_GOALIE;