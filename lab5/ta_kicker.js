const TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: { dist: null, angle: null }, // Переменные
        timers: { t: 0 }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },
    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на которые есть переходы */
        start: { n: "start", e: ["close", "near"]},
        close: { n: "close", e: ["kick"] },
        kick: { n: "kick", e: ["start"] },
        near: { n: "near", e: ["intercept", "start"] },
        intercept: { n: "intercept", e: ["start"] },
    },
    edges: {/* Ребра автомата (имя каждого ребра указывает на узел-источник и узел-приемник) */
        /* Список guard описывает перечень условий, проверяемых
      * для перехода по ребру. Знак lt - меньше, lte - меньше
      * либо равно. В качестве параметров принимаются числа или
      * значения переменных "v" или таймеров "t" */
        start_close: [{ guard: [{ s: "lte", l: {v: "dist"}, r: 0.5 }] }],
        start_near: [{ guard: [{ s: "gt", l: {v: "dist"}, r: 0.5 }] }],
        close_kick: [{ synch: "kick!" }],
        kick_start: [{ }],
        near_start: [{ synch: "empty!" }],
        near_intercept: [{ synch: "canIntercept?" }],
        intercept_start: [{ synch: "runToBall!" }]
    },
    actions: {
        init(taken, state) { // Инициализация игрока
            state.local.goalie = true;
            state.local.catch = 0;
        },
        beforeAction(taken, state) {
            // Действие перед каждым вычислением
            if(taken.ball) state.variables.dist = taken.ball.dist
        },
        kick(taken, state) { // Пинаем мяч
            state.next = true;
            if(!taken.ball) {
                return;
            }
            let dist = taken.ball.dist;

            if(dist > 0.5) {
                return;
            }

            if(taken.goal !== undefined) {
                return {n: "kick", v:`40 ${taken.goal.angle}`};
            }

            return {n: "kick", v: "10 45"}
        },
        canIntercept(taken, state) { // Можем добежать первыми
            let ball = taken.ball;
            state.next = true;
            if(!ball) return false;

            return ball.dist > 0.5;
        },
        runToBall(taken, state) { // Бежим к мячу
            state.next = false;
            let ball = taken.ball;
            if(!ball) {
                return {n: "turn", v: "45"};
            }

            if(ball.dist <= 0.5) {
                state.next = true;
                return
            }

            if(Math.abs(ball.angle) > 10)
                return {n: "turn", v: ball.angle};
            if(ball.dist < 0.5) {
                state.next = true;
                return
            }
            return {n: "dash", v: 40}
        },
        ok(taken, state) { // Ничего делать не надо
            state.next = true; return {n: "turn", v: 0}
        },
        empty(taken, state) { state.next = true } // Пустое действие
    }
};

module.exports = {
    TA: TA
};