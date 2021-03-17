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

            return {n: "kick", v: `10 ${this.side === "l" ? -45 : 45}`}
        }
    },
    defendGoal(takenState) { // Защита ворот
        this.last = "defend";

        if(takenState.ball && takenState.ball.dist) {
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
            if (this.side === "l") {
                if (takenState.lookAroundFlags.fprt !== undefined) {
                    if (takenState.lookAroundFlags.fprt.dist < min) {
                        min = takenState.lookAroundFlags.fprt.dist;
                    }
                }

                if (!isActionArea && takenState.lookAroundFlags.fprb !== undefined) {
                    if (takenState.lookAroundFlags.fprb.dist < min) {
                        min = takenState.lookAroundFlags.fprb.dist;
                    }
                }

                if (!isActionArea && takenState.lookAroundFlags.fprc !== undefined) {
                    if (takenState.lookAroundFlags.fprc.dist < min) {
                        min = takenState.lookAroundFlags.fprc.dist;
                    }
                }
            } else {
                if (takenState.lookAroundFlags.fplt !== undefined) {
                    if (takenState.lookAroundFlags.fplt.dist < min) {
                        min = takenState.lookAroundFlags.fplt.dist;
                    }
                }

                if (!isActionArea && takenState.lookAroundFlags.fplb !== undefined) {
                    if (takenState.lookAroundFlags.fplb.dist < min) {
                        min = takenState.lookAroundFlags.fplb.dist;
                    }
                }

                if (!isActionArea && takenState.lookAroundFlags.fplc !== undefined) {
                    if (takenState.lookAroundFlags.fplc.dist < min) {
                        min = takenState.lookAroundFlags.fplc.dist;
                    }
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