const FlagsCoords = {
    ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
    ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
    ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
    ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
    ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
    ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
    fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
    fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
    fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
    fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
    fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
    flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
    flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
    flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
    flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
    fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
    gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
    flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
    fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
    distance(p1, p2) {
        return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
    },
};

const Taken = {
    state: {
        team: [], // моя команда
        rivalTeam: [], // команда соперника
    },
    setHear(input) {
    },
    parseInput(object) {
        if (!object) {
            return undefined;
        }

        const parsedData = { f: object.cmd.p.join('') };

        if (object.p.length === 1) {
            parsedData.angle = object.p[0];
        } else {
            parsedData.dist = object.p[0];
            parsedData.angle = object.p[1];
        }

        return parsedData;
    },
    setSee(input, team, side) {
        // запоминание времени игры
        this.state.time = input[0];
        // запоминание информации о видимом мяче
        this.state.ball = this.parseInput(input.find(obj => obj.cmd && obj.cmd.p[0] === 'b'));
        // запоминание информации о видимых воротах
        let gr = this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'gr'));
        let gl = this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'gl'));
        this.state.goalOwn = side === 'l' ? gl : gr;
        this.state.goal = side === 'l' ? gr : gl;
        // запоминание информации о видимых флагах
        this.state.lookAroundFlags = {
            fprb: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprb')),
            fprc: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprc')),
            fprt: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprt'))
        };

        // запоминание информации о видимых игроках
        this.state.team = input.filter(obj => obj.cmd && obj.cmd.p[0] === 'p' && obj.cmd.p.includes(team)).map(obj => this.parseInput(obj));
        this.state.rivalTeam = input.filter(obj => obj.cmd && obj.cmd.p[0] === 'p' && !obj.cmd.p.includes(team)).map(obj => this.parseInput(obj));

        return this.state
    },
};

module.exports = Taken;