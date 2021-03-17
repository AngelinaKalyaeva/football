const CTRL_MIDDLE_KICKER = {
    action: "return",
    turnData: "frt",

    execute(takenState, flag, controllers) {
        const next = controllers[0]; // Следующий уровень

        switch (this.action) {
            case "return": {
                takenState.cmd = this.actionReturn(takenState, flag);
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
            const command = next.execute(takenState, flag, controllers.slice(1));

            if(command) {
                return command;
            }

            if(takenState.newAction) {
                this.action = takenState.newAction;
            }

            return takenState.cmd
        }
    },
    actionReturn(takenState, flag) { // Возврат к своим воротам
        if(!takenState.lookAroundFlags[flag]) {
            return {n: "turn", v: 60};
        }

        if(Math.abs(takenState.lookAroundFlags[flag].angle) > 10) {
            return {n: "turn", v: takenState.lookAroundFlags[flag].angle};
        }

        if(takenState.lookAroundFlags[flag].dist > 3) {
            return {n: "dash", v: takenState.lookAroundFlags[flag].dist * 2 + 30};
        }

        this.action = "rotateCenter";
        return {n: "turn", v: 180}
    },
    rotateCenter(takenState) { // Повернуться к центру
        if(takenState.goal === undefined) {
            return {n: "turn", v: 60};
        }

        this.action = "seekBall";
        return {n: "turn", v: takenState.goal.angle}
    },
    seekBall(takenState) { // Осмотр поля
        if(takenState.flags !== undefined && takenState.flags[this.turnData] !== undefined) {
            if(Math.abs(takenState.flags[this.turnData].angle) > 10) {
                return {n: "turn", v: takenState.flags[this.turnData].angle};
            }

            if(this.turnData === "frt") {
                this.turnData = "frb";
            } else {
                if (this.turnData === "frb") {
                    this.turnData = "frt";
                    this.action = "rotateCenter";
                    return this.rotateCenter(takenState);
                }
            }
        }

        if(this.turnData === "frt") {
            return {n: "turn", v: this.side === "l" ? -30 : 30};
        }

        if(this.turnData === "frb") {
            return {n: "turn", v: this.side === "l" ? 30 : -30};
        }

        throw `Unexpected state ${JSON.stringify(this)}, ${JSON.stringify(takenState)}`
    },
};

module.exports = CTRL_MIDDLE_KICKER;