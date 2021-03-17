const CTRL_MIDDLE_GOALIE = {
    action: "return",
    turnData: "ft0",

    execute(takenState, controllers) {
        const next = controllers[0]; // Следующий уровень

        switch (this.action) {
            case "return": {
                takenState.cmd = this.actionReturn(takenState);
                break;
            }
            case "rotateCenter": {
                takenState.cmd = this.rotateCenter(takenState);
                break;
            }
            case "seekBall": {
                takenState.cmd = this.seekBall(takenState);
                break;
            }
        }

        takenState.action = this.action;

        if(next) { // Вызов следующего уровня
            const command = next.execute(takenState, controllers.slice(1));

            if(command) {
                return command;
            }

            if(takenState.newAction) {
                this.action = takenState.newAction;
            }

            return takenState.cmd
        }
    },
    actionReturn(takenState) { // Возврат к своим воротам
        if(!takenState.goalOwn) {
            return {n: "turn", v: 60};
        }

        if(Math.abs(takenState.goalOwn.angle) > 10) {
            return {n: "turn", v: takenState.goalOwn.angle};
        }

        if(takenState.goalOwn.dist > 3) {
            return {n: "dash", v: takenState.goalOwn.dist * 2 + 30};
        }

        this.action = "rotateCenter";
        return {n: "turn", v: 180}
    },
    rotateCenter(takenState) { // Повернуться к центру
        if(!takenState.flags["fc"]) {
            return {n: "turn", v: 60};
        }

        this.action = "seekBall";
        return {n: "turn", v: takenState.flags["fc"].angle}
    },
    seekBall(takenState) { // Осмотр поля
        if(takenState.flags[this.turnData]) {
            if(Math.abs(takenState.flags[this.turnData].angle) > 10) {
                return {n: "turn", v: takenState.flags[this.turnData].angle};
            }

            if(this.turnData === "ft0") {
                this.turnData = "fb0";
            } else {
                if (this.turnData === "fb0") {
                    this.turnData = "ft0";
                    this.action = "rotateCenter";
                    return this.rotateCenter(takenState);
                }
            }
        }

        if(this.turnData === "ft0") {
            return {n: "turn", v: this.side === "l" ? -30 : 30};
        }

        if(this.turnData === "fb0") {
            return {n: "turn", v: this.side === "l" ? 30 : -30};
        }

        throw `Unexpected state ${JSON.stringify(this)}, ${JSON.stringify(takenState)}`
    },
};
module.exports = CTRL_MIDDLE_GOALIE;