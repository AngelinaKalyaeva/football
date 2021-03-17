const TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: {dist: null}, // Переменные
        timers: {t: 0}, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },
    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на которые есть переходы */
        start: {n: "start", e: ["close", "near", "far"]},
        close: {n: "close", e: ["catch"]},
        catch: {n: "catch", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        far: {n: "far", e: ["start"]},
        near: {n: "near", e: ["intercept", "start"]},
        intercept: {n: "intercept", e: ["start"]},
    },
    edges: { /* Ребра автомата (имя каждого ребра указывает на узел-источник и узел-приемник) */
        /* Список guard описывает перечень условий, проверяемых
      * для перехода по ребру. Знак lt - меньше, lte - меньше
      * либо равно. В качестве параметров принимаются числа или
      * значения переменных "v" или таймеров "t" */
        start_close: [{guard: [{s: "lt", l: {v: "dist"}, r: 2}]}],
        start_near: [{guard: [{s: "lt", l: {v: "dist"}, r: 10}, {s: "lte", l: 2, r: {v: "dist"}}]}],
        start_far: [{guard: [{s: "lte", l: 10, r: {v: "dist"}}]}],
        close_catch: [{synch: "catch!"}],
        /* Событие синхронизации synch вызывает на выполнение
        * соответствующую функцию */
        catch_kick: [{synch: "kick!"}],
        kick_start: [{
            synch: "goBack!", assign: [{
                n: "t", v: 0,
                type: "timer"
            }]
        }],
        /* Список assign перечисляет присваивания для переменных
        * "variable" и таймеров "timer" */
        far_start: [{
            guard: [{s: "lt", l: 10, r: {t: "t"}}],
            synch: "lookAround!",
            assign: [{n: "t", v: 0, type: "timer"}]
        },
            {
                guard: [{s: "lte", l: {t: "t"}, r: 10}],
                synch: "ok!"
            }],
        near_start: [{
            synch: "empty!",
            assign: [{n: "t", v: 0, type: "timer"}]
        }],
        near_intercept: [{synch: "canIntercept?"}],
        /* Событие синхронизации synch может вызывать
        * соответствующую функцию для проверки возможности перехода
        * по ребру (заканчивается на знак "?") */
        intercept_start: [{
            synch: "runToBall!", assign: [{
                n: "t",
                v: 0, type: "timer"
            }]
        }]
    },
    actions: {
        init(taken, state) { // Инициализация игрока
            state.local.goalie = true;
            state.local.catch = 0;
        },
        beforeAction(taken, state) {
            // Действие перед каждым вычислением
            if (taken.ball) state.variables.dist = taken.ball.dist
        },
        catch(taken, state) { // Ловим мяч
            if (!taken.ball) {
                state.next = true;
                return;
            }
            let angle = taken.ball.angle;
            let dist = taken.ball.dist;
            state.next = false;
            if (dist > 0.5) {
                if (state.local.goalie) {
                    if (state.local.catch < 3) {
                        state.local.catch++;
                        return {n: "catch", v: angle}
                    } else state.local.catch = 0;
                }
                if (Math.abs(angle) > 15) return {n: "turn", v: angle};
                return {n: "dash", v: 20}
            }
            state.next = true
        },
        kick(taken, state) { // Пинаем мяч
            state.next = true;
            if (!taken.ball) return;
            let dist = taken.ball.dist;
            if (dist > 0.5) return;
            let goal = taken.goal;
            let player = taken.team ? taken.team[0] : null;
            let target;
            if (goal && player)
                target = goal.dist < player.dist ? goal : player;
            else if (goal) target = goal;
            else if (player) target = player;
            if (target) return {n: "kick", v: `${target.dist * 2 + 40} ${target.angle}`};
            return {n: "kick", v: "30 45"}
        },
        goBack(taken, state) { // Возврат к воротам
            state.next = false;
            let goalOwn = taken.goalOwn;
            if (!goalOwn) return {n: "turn", v: 60};
            if (Math.abs(goalOwn.angle) > 2)
                return {n: "turn", v: goalOwn.angle};
            if (goalOwn.dist < 2) {
                state.next = true;
                return {n: "turn", v: 180}
            }
            return {n: "dash", v: goalOwn.dist * 2 + 20}
        },
        lookAround(taken, state) { // Осматриваемся
            state.next = false;
            state.synch = "lookAround!";

            if (!state.local.look) {
                if (!taken.lookAroundFlags.fprc) return {n: "turn", v: 60};
                state.local.look = "left";
                return {n: "turn", v: taken.lookAroundFlags.fprc.angle}
            }

            switch (state.local.look) {
                case "left":
                    if (!taken.lookAroundFlags.fprc) return {n: "turn", v: 60};
                    state.local.look = "center";
                    return {
                        n: "turn", v: -60
                    };
                case "center":
                    state.local.look = "right";
                    return {
                        n: "turn", v: 60
                    };

                case "right":
                    state.local.look = "back";
                    return {
                        n: "turn", v: 60
                    };
                case "back":
                    state.local.look = "left";
                    state.next = true;
                    state.synch = undefined;
                    return {
                        n: "turn", v: -60
                    };
                default:
                    state.next = true;
                    return {n: "turn", v: taken.lookAroundFlags.fprc.angle};
            }
        },
        canIntercept(taken, state) { // Можем добежать первыми
            let ball = taken.ball;
            let ballPrev = taken.ballPrev;
            state.next = true;
            if (!ball) return false;
            if (taken.rivalTeam) {
                const rival = taken.rivalTeam.find(rival => {
                    let degrees = Math.sign(rival.angle) === Math.sign(ball.angle)
                        ? Math.max(Math.abs(rival.angle), Math.abs(ball.angle)) - Math.min(Math.abs(rival.angle), Math.abs(rival.angle))
                        : Math.abs(rival.angle) + Math.abs(ball.angle);
                    const rivalDistanceToBall = Math.sqrt(rival.dist ** 2 + ball.dist ** 2 - 2 * rival.dist * ball.dist * Math.cos(degrees * Math.PI / 180));
                    return rivalDistanceToBall < ball.dist
                });
                return !rival;
            }

            if (!ballPrev) return true;
            return ball.dist <= ballPrev.dist + 0.5;

        },
        runToBall(taken, state) { // Бежим к мячу
            state.next = false;
            let ball = taken.ball;
            if (!ball) return this.goBack(taken, state);
            if (ball.dist <= 2) {
                state.next = true;
                return
            }
            if (Math.abs(ball.angle) > 10)
                return {n: "turn", v: ball.angle};
            if (ball.dist < 2) {
                state.next = true;
                return
            }
            return {n: "dash", v: 110}
        },
        ok(taken, state) { // Ничего делать не надо
            state.next = true;
            return {n: "turn", v: 0}
        },
        empty(taken, state) {
            state.next = true
        } // Пустое действие
    }
};

module.exports = {
    TA: TA
};