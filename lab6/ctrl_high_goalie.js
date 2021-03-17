const CTRL_HIGH_GOALIE = {
    execute(takenState) {
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
            var isRivalClosest = takenState.rivalTeam.find(rival => {
                let degrees = Math.sign(rival.angle) === Math.sign(takenState.ball.angle)
                    ? Math.max(Math.abs(rival.angle), Math.abs(takenState.ball.angle)) - Math.min(Math.abs(rival.angle), Math.abs(rival.angle))
                    : Math.abs(rival.angle) + Math.abs(takenState.ball.angle);
                const rivalDistanceToBall = Math.sqrt(
                    rival.dist ** 2 + takenState.ball.dist ** 2 - 2 * rival.dist * takenState.ball.dist * Math.cos(degrees * Math.PI / 180)
                );
                return rivalDistanceToBall < takenState.ball.dist
            });
            if (isRivalClosest === undefined) {
                isRivalClosest = false
            }

            var isActionArea = false;
            if (this.side === "l") {
                if (takenState.lookAroundFlags.fplb !== undefined) {
                    isActionArea = takenState.ball.dist < takenState.lookAroundFlags.fplb.dist;
                }

                if (!isActionArea && takenState.lookAroundFlags.fplc !== undefined) {
                    isActionArea = takenState.ball.dist < takenState.lookAroundFlags.fplc.dist;
                }

                if (!isActionArea && takenState.lookAroundFlags.fplt !== undefined) {
                    isActionArea = takenState.ball.dist < takenState.lookAroundFlags.fplt.dist;
                }
            } else {
                if (takenState.lookAroundFlags.fprb !== undefined) {
                    isActionArea = takenState.ball.dist < takenState.lookAroundFlags.fprb.dist;
                }

                if (!isActionArea && takenState.lookAroundFlags.fprc !== undefined) {
                    isActionArea = takenState.ball.dist < takenState.lookAroundFlags.fprc.dist;
                }

                if (!isActionArea && takenState.lookAroundFlags.fprt !== undefined) {
                    isActionArea = takenState.ball.dist < takenState.lookAroundFlags.fprt.dist;
                }
            }

            if((takenState.ball.dist < 7) || (!isRivalClosest && isActionArea)) {
                if(Math.abs(takenState.ball.angle) > 5) {
                    return {n: "turn", v: takenState.ball.angle};
                }

                return {n: "dash", v: 110}
            }
        }
    },
};

module.exports = CTRL_HIGH_GOALIE;