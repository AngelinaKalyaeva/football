const commandManager = {
    getVisible(flag) {
        if (flag === "p") {
            for (let i = 1; i < this.p.length; ++i) {
                if (this.p[i] !== undefined
                    && this.p[i].cmd !== undefined
                    && this.p[i].cmd.p !== undefined
                    && this.p[i].cmd.p.length >= 0
                    && this.p[i].cmd.p[0] === flag
                    && this.p[i].p.length >= 2
                ) {
                    return true;
                }
            }
            return false;
        }

        for (let i = 1; i < this.p.length; ++i) {
            if (this.p[i] !== undefined
                && this.p[i].cmd !== undefined
                && this.p[i].cmd.p !== undefined
                && this.p[i].cmd.p.length >= 0
                && this.p[i].cmd.p.join('') === flag
                && this.p[i].p.length >= 2
            ) {
                return true;
            }
        }
        return false;
    },
    getDistance(flag) {
        let min = 32000;
        let count = 0;
        if (flag === "p") {
            for (let i = 1; i < this.p.length; ++i) {
                if (this.p[i] !== undefined
                    && this.p[i].cmd !== undefined
                    && this.p[i].cmd.p !== undefined
                    && this.p[i].cmd.p.length >= 0
                    && this.p[i].cmd.p[0] === flag
                    && this.p[i].p.length >= 1
                ) {
                    ++count;
                    if (this.p[i].p[0] < min) min = this.p[i].p[0];
                }
            }

            return min;
        }

        for (let i = 1; i < this.p.length; ++i) {
            if (this.p[i] !== undefined
                && this.p[i].cmd !== undefined
                && this.p[i].cmd.p !== undefined
                && this.p[i].cmd.p.length >= 0
                && this.p[i].cmd.p.join('') === flag
                && this.p[i].p.length >= 1
            ) {
                if (this.p[i].p[0] < min) min = this.p[i].p[0];
            }
        }
        return min;
    },
    getAngle(flag) {
        let angle = 0;
        let min = 32000;
        if (flag === "p") {
            for (let i = 1; i < this.p.length; ++i) {
                if (this.p[i] !== undefined
                    && this.p[i].cmd !== undefined
                    && this.p[i].cmd.p !== undefined
                    && this.p[i].cmd.p.length >= 0
                    && this.p[i].cmd.p[0] === flag
                    && this.p[i].p.length >= 2
                ) {
                    if (this.p[i].p[0] < min) {
                        min = this.p[i].p[0];
                        angle = this.p[i].p[1];
                    }
                }
            }
            return angle;
        }

        for (let i = 1; i < this.p.length; ++i) {
            if (this.p[i] !== undefined
                && this.p[i].cmd !== undefined
                && this.p[i].cmd.p !== undefined
                && this.p[i].cmd.p.length >= 0
                && this.p[i].cmd.p.join('') === flag
                && this.p[i].p.length >= 2
            ) {
                return this.p[i].p[1];
            }
        }

        return null;
    },
};

const DT = {
    state: {
        next: 0,
        sequence: [
            {act: "flag", fl: 'gr', maxDistance: 3, minDistance: 1},
            {act: "kick", fl: 'b', goal: 'gl'}
        ],
        command: null
    },
    root: {
        exec(state) { state.action = state.sequence[state.next]; state.command = null },
        next: 'goalVisible'
    },
    goalVisible: {
        condition: (state) => commandManager.getVisible(state.action.fl),
        trueCond: 'rootNext',
        falseCond: 'rotate'
    },
    rotate: {
        exec(state) { state.command = { n: 'turn',  v: '45' } },
        next: 'sendCommand'
    },
    rootNext: {
        condition: (state) => state.action.act === "flag",
        trueCond: 'flagSeek',
        falseCond: 'rotateToBall'
    },
    flagSeek: {
        condition: (state) => commandManager.getDistance(state.action.fl) < state.action.maxDistance,
        trueCond: 'checkMinDistance',
        falseCond: 'farGoal'
    },
    checkMinDistance: {
        condition: (state) => commandManager.getDistance(state.action.fl) < state.action.minDistance,
        trueCond: 'tooCloseGoal',
        falseCond: 'closeFlag'
    },
    closeFlag: {
        exec(state) { state.next = (state.next + 1) % 2; state.action = state.sequence[state.next]; },
        next: 'rootNext',
    },
    tooCloseGoal: {
        condition: (state) => commandManager.getAngle(state.action.fl) > 4,
        trueCond: 'rotateToGoal',
        falseCond: 'runFromGoal',
    },
    runFromGoal: {
        exec(state) {state.command = { n: 'dash', v: -100}},
        next: 'sendCommand'
    },
    farGoal: {
        condition: (state) => commandManager.getAngle(state.action.fl) > 4,
        trueCond: 'rotateToGoal',
        falseCond: 'runToGoal',
    },
    rotateToGoal: {
        exec(state) {state.command = {n: 'turn', v: commandManager.getAngle(state.action.fl)}},
        next: 'sendCommand',
    },
    runToGoal: {
        exec(state) { state.command = { n: 'dash', v: 80 } },
        next: 'sendCommand'
    },
    rotateToBall: {
        condition: (state) => commandManager.getAngle(state.action.fl) > 4,
        trueCond: 'rotateToGoal',
        falseCond: 'checkMaxDistanceToBall'
    },
    checkMinDistanceToBall: {
        condition: (state) => commandManager.getDistance(state.action.fl) > 2,
        trueCond: 'farGoal',
        falseCond: 'checkDistanceForKick'
    },
    checkMaxDistanceToBall: {
        condition: (state) => commandManager.getDistance(state.action.fl) < 28,
        trueCond: 'checkMinDistanceToBall',
        falseCond: 'rotateToGoal'
    },
    checkDistanceForKickAndCatch: {
        condition: (state) => commandManager.getDistance("b") >= 0.5 && commandManager.getDistance(state.action.fl) <= 2,
        trueCond: 'doCatch',
        falseCond: 'checkDistanceForKick',
    },
    checkDistanceForKick: {
        condition: (state) => commandManager.getDistance(state.action.fl) <= 0.5,
        trueCond: 'doKick',
        falseCond: 'farGoal',
    },
    doCatch: {
        exec(state) {state.command = { n: 'catch', v: commandManager.getAngle(state.action.fl) }},
        next: 'sendCommand'
    },
    doKick: {
        condition: (state) => commandManager.getVisible(state.action.goal),
        trueCond: 'ballGoalVisible',
        falseCond: 'ballGoalInvisible',
    },
    ballGoalVisible: {
        exec(state) {
            state.command = { n: 'kick', v: `100 ${commandManager.getAngle(state.action.goal)}`};
            state.next = 0
        },
        next: 'sendCommand'
    },
    ballGoalInvisible: {
        exec(state) {state.command = {n: 'kick', v: '20 45'}},
        next: 'sendCommand'
    },
    sendCommand: {
        command: (state) => state.command
    }
};

module.exports = {
    commandManager: commandManager,
    DT: DT
};
