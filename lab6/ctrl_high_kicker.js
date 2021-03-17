const CTRL_HIGH_HALFBACK = {
    execute(takenState, flag, controllers) {
        const immediate = this.immediateReaction(takenState);

        if(immediate) {
            return immediate;
        }

        const defend = this.defendGoal(takenState);
        if(defend) {
            return defend;
        }

        if(this.last === "defend") {
            takenState.newAction = "return";
        }

        this.last = "previous";
    },
    immediateReaction(takenState) { // Немедленная реакция
        if(takenState.canKick) {
            this.last = "kick";
            if(takenState.goal) {
                return {n: "kick", v: `110 ${takenState.goal.angle}`};
            }

            return {n: "kick", v: `10 ${this.side === "l" ? -45 : 45}`}
        }
    },
    defendGoal(takenState) {
        this.last = "defend";

        if(takenState.ball && takenState.ball.dist) {
                if(Math.abs(takenState.ball.angle) > 5) {
                    return {n: "turn", v: takenState.ball.angle};
                }

                return {n: "dash", v: 80}
        }
    },
};

module.exports = CTRL_HIGH_HALFBACK;