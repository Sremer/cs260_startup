export class PlayState {
    static InPlay = new PlayState('in play');
    static Finished = new PlayState('finished');

    constructor(name) {
        this.name = name;
    }
}