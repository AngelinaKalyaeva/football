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
            if (takenState.closestTeamPlayer !== undefined) {
                return {n: "kick", v: `${takenState.closestTeamPlayer.dist + 30} ${takenState.closestTeamPlayer.angle}`};
            } else if (takenState.goal) {
                return {n: "kick", v: `110 ${takenState.goal.angle}`};
            }

            return {n: "kick", v: `10 45`}
        }
    },
    defendGoal(takenState) { // Защита ворот
        this.last = "defend";

        if(takenState.ball) {
            var isTeamClosest = takenState.team.find(rival => {
                let degrees = Math.sign(rival.angle) === Math.sign(takenState.ball.angle)
                    ? Math.max(Math.abs(rival.angle), Math.abs(takenState.ball.angle)) - Math.min(Math.abs(rival.angle), Math.abs(rival.angle))
                    : Math.abs(rival.angle) + Math.abs(takenState.ball.angle);
                const rivalDistanceToBall = Math.sqrt(
                    rival.dist ** 2 + takenState.ball.dist ** 2 - 2 * rival.dist * takenState.ball.dist * Math.cos(degrees * Math.PI / 180)
                );
                return rivalDistanceToBall < takenState.ball.dist
            });

            if (isTeamClosest === undefined) {
                isTeamClosest = false;
            }

            var isActionArea = false;
            var min = 32000;
            if (takenState.lookAroundFlags.fct !== undefined) {
                if (min > takenState.lookAroundFlags.fct.dist) {
                    min = takenState.lookAroundFlags.fct.dist;
                }
            }

            if (!isActionArea && takenState.lookAroundFlags.fc !== undefined) {
                if (min > takenState.lookAroundFlags.fc.dist) {
                    min = takenState.lookAroundFlags.fc.dist;
                }
            }

            if (!isActionArea && takenState.lookAroundFlags.fcb !== undefined) {
                if (min > takenState.lookAroundFlags.fcb.dist) {
                    min = takenState.lookAroundFlags.fcb.dist;
                }
            }

            if (min < 32000 && ((takenState.ball.dist + 1) < min)) {
                isActionArea = true;
            }

            if(!isTeamClosest && ((takenState.ball.dist < 10) || (isActionArea))) {
                if(Math.abs(takenState.ball.angle) > 5) {
                    return {n: "turn", v: takenState.ball.angle};
                }

                return {n: "dash", v: 110}
            }
        }
    },
};

module.exports = CTRL_HIGH_HALFBACK;