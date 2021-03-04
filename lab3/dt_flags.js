const commandManager = {
    getVisible(flag) {
        if (flag === "p") {
            for (let i = 1; i < this.p.length; ++i) {
                if (this.p[i] !== undefined
                    && this.p[i].cmd !== undefined
                    && this.p[i].cmd.p !== undefined
                    && this.p[i].cmd.p.length > 1
                    && this.p[i].cmd.p[0] === flag
                    && this.p[i].p.length >= 2
                ) {
                    if (JSON.stringify(this.p[i].cmd.p[1]).includes("teamA")) {
                        return true;
                    }
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

const DT_FLAGS = {
    state: {
        next: 0,
        sequence: [{act: "flag", fl: "fplt"}, {act: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}],
        command: null
    },
    root: {
        exec(state) { state.action = state.sequence[state.next]; state.command = null },
        next: "checkIsLeaderVisible",
    },
    checkIsLeaderVisible: {
        condition: (state) => commandManager.getVisible("p"),
        trueCond: "leaderVisible",
        falseCond: "goalVisible",
    },
    leaderVisible: {
        condition: (state) => commandManager.getDistance("p") < 1 && Math.abs(commandManager.getAngle("p")) < 40,
        trueCond: "turnToLeft",
        falseCond: "goToLeader",
    },
    turnToLeft: {
        exec (state) { state.command = {n: "turn", v: 30} },
        next: "sendCommand",
    },
    goToLeader: {
        condition: (state) => commandManager.getDistance("p") > 10,
        trueCond: "catchingUp",
        falseCond: "joinToLeader",
    },
    catchingUp: {
        condition: (state) => Math.abs(commandManager.getAngle("p")) > 5,
        trueCond: "turnToCatchingUp",
        falseCond: "dashToCatchingUp",
    },
    turnToCatchingUp: {
        exec (state) { state.command = {n: "turn", v: commandManager.getAngle("p") } },
        next: "sendCommand",
    },
    dashToCatchingUp: {
        exec (state) { state.command = {n: "dash", v: 80} },
        next: "sendCommand",
    },
    joinToLeader: {
        condition: (state) => commandManager.getAngle("p") > 40 || commandManager.getAngle("p") < 25,
        trueCond: "turnToJoinToLeader",
        falseCond: "dashToJoinToLeader",
    },
    turnToJoinToLeader : {
        exec (state) { state.command = {n: "turn", v: commandManager.getAngle("p") - 30} },
        next: "sendCommand",
    },
    dashToJoinToLeader: {
        condition: (state) => commandManager.getDistance("p") < 7,
        trueCond: "lowDashToJoinToLeader",
        falseCond: "fastDashToJoinToLeader",
    },
    lowDashToJoinToLeader: {
        exec (state) { state.command = {n: "dash", v: 30 } },
        next: "sendCommand",
    },
    fastDashToJoinToLeader: {
        exec (state) { state.command = {n: "dash", v: 80 } },
        next: "sendCommand",
    },
    goalVisible: {
        condition: (state) => commandManager.getVisible(state.action.fl),
        trueCond: "rootNext",
        falseCond: "rotate",
    },
    rootNext: {
        condition: (state) => state.action.act === "flag",
        trueCond: "flagSeek",
        falseCond: "ballSeek"
    },
    flagSeek: {
        condition: (state) => 3 > commandManager.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal",
    },
    closeFlag: {
        exec(state) { state.next = (state.next + 1) % 3; state.action = state.sequence[state.next]; },
        next: "root",
    },
    farGoal: {
        condition: (state) => Math.abs(commandManager.getAngle(state.action.fl)) >= 2,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal",
    },
    rotateToGoal: {
        exec (state) { state.command = {n: "turn", v: commandManager.getAngle(state.action.fl)} },
        next: "sendCommand",
    },
    runToGoal: {
        exec (state) { state.command = {n: "dash", v: 40} },
        next: "sendCommand",
    },
    rotate: {
        exec (state) { state.command = {n: "turn", v: "90"} },
        next: "sendCommand",
    },
    ballSeek: {
        condition: (state) => 0.5 > commandManager.getDistance(state.action.fl),
        trueCond: "closeBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (state) => commandManager.getVisible(state.action.goal),
        trueCond: "ballGoalVisible",
        falseCond: "ballGoalInvisible",
    },
    ballGoalVisible: {
        exec (state) { state.command =
            {n: "kick", v: `80 ${commandManager.getAngle(state.action.goal)}`}},
        next: "sendCommand",
    },
    ballGoalInvisible: {
        exec (state) {state.command = {n: "kick", v: "10 45"}},
        next: "sendCommand",
    },
    sendCommand: {
        command: (state) => state.command
    },
};

module.exports = {
    commandManager: commandManager,
    DT_FLAGS: DT_FLAGS
};