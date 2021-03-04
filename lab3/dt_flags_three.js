const commandManager = {
    getVisible(flag) {
        var count = 0;
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
                        count++;
                    }
                }
            }
            return count;
        }

        count = 0;
        for (let i = 1; i < this.p.length; ++i) {
            if (this.p[i] !== undefined
                && this.p[i].cmd !== undefined
                && this.p[i].cmd.p !== undefined
                && this.p[i].cmd.p.length >= 0
                && this.p[i].cmd.p.join('') === flag
                && this.p[i].p.length >= 2
            ) {
                count++
            }
        }
        return count;
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
            console.log("angle = " + angle);
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
        sequence: [{act: "flag", fl: "fc"}, {act: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}],
        command: null
    },
    root: {
        exec(state) { state.action = state.sequence[state.next]; state.command = null },
        next: "checkIsLeaderVisible",
    },
    checkIsLeaderVisible: {
        condition: (state) => commandManager.getVisible("p") !== 0,
        trueCond: "checkPositionByPlayers",
        falseCond: "goalVisible",
    },
    checkPositionByPlayers: {
        condition: (state) => commandManager.getVisible("p") !== 0,
        trueCond: "leaderVisible",
        falseCond: "secondPlayerVisible",
    },
    secondPlayerVisible: {
        condition: (state) => commandManager.getDistance("p") < 5,
        trueCond: "turnFromSecondPlayer",
        falseCond: "dashFromSecondPlayer",
    },
    turnFromSecondPlayer: {
        exec (state) { state.command = {n: "turn", v: commandManager.getAngle("p") - 30} },
        next: "sendCommand",
    },
    dashFromSecondPlayer: {
        exec (state) { state.command = {n: "dash", v: 90} },
        next: "sendCommand",
    },
    leaderVisible: {
        condition: (state) => commandManager.getDistance("p") < 3 && Math.abs(commandManager.getAngle("p")) < 40,
        trueCond: "turn",
        falseCond: "goToLeader",
    },
    turn: {
        exec (state) { state.command = {n: "turn", v:  30} },
        next: "sendCommand",
    },
    goToLeader: {
        condition: (state) => commandManager.getDistance("p") > 10,
        trueCond: "catchingUp",
        falseCond: "joinToLeader",
    },
    catchingUp: {
        condition: (state) => Math.abs(commandManager.getAngle("p")) > 8,
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
        condition: (state) => Math.abs(commandManager.getAngle("p")) > 45 || Math.abs(commandManager.getAngle("p")) < 20,
        trueCond: "turnToJoinToLeader",
        falseCond: "dashToJoinToLeader",
    },
    turnToJoinToLeader : {
        next: "sendCommand",
        exec (state) { state.command = {n: "turn", v: commandManager.getAngle("p") - Math.sign(commandManager.getAngle("p"))*30 } },
    },
    dashToJoinToLeader: {
        condition: (state) => commandManager.getDistance("p") < 4,
        trueCond: "lowDashToJoinToLeader",
        falseCond: "fastDashToJoinToLeader",
    },
    lowDashToJoinToLeader: {
        exec (state) { state.command = {n: "dash", v: 30 } },
        next: "sendCommand",
    },
    fastDashToJoinToLeader: {
        exec (state) { state.command = {n: "dash", v: 60 } },
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
        exec (state) { state.command = {n: "turn", v: "-90"} },
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