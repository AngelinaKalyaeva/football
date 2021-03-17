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
            fprt: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprt')),
            fplt: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fplt')),
            fplc: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fplc')),
            fplb: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fplb')),
            fct: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fct')),
            fc: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fc')),
            fcb: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fcb')),
            frt: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'frt')),
            frb: this.parseInput(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'frb')),
        };

        this.state.team = input.filter(obj => obj.cmd
            && obj.cmd.p[0]
            && obj.cmd.p[1]
            && obj.cmd.p[0] === 'p'
            && obj.cmd.p[1].includes(team)
        ).map(obj => this.parseInput(obj));

        this.state.closestTeamPlayer = input.filter(obj => obj.cmd
            && obj.cmd.p[0]
            && obj.cmd.p[1]
            && obj.cmd.p[0] === 'p'
            && obj.cmd.p.length < 3
            && obj.cmd.p[1].includes(team)
        ).map(obj => this.parseInput(obj));

        if (this.state.closestTeamPlayer.length > 0) {
            this.state.closestTeamPlayer = this.state.closestTeamPlayer.reduce(
                (acc, loc) =>
                    acc.dist < loc.dist
                        ? acc
                        : loc
            );
        } else {
            this.state.closestTeamPlayer = undefined;
        }

        this.state.rivalTeam = input.filter(obj => obj.cmd
            && obj.cmd.p[0]
            && obj.cmd.p[1]
            && obj.cmd.p[0] === 'p'
            && !obj.cmd.p[1].includes(team)
        ).map(obj => this.parseInput(obj));

        return this.state
    },
};

module.exports = Taken;