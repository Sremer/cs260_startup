class GameData {
    playerName;
    friendName;
    songTitle;
    artist;
    lyrics;
    percent;
    withFriend;

    clearData() {
        this.playerName = localStorage.getItem('username');

        this.friendName = '';
        this.songTitle = '';
        this.artist = '';
        this.lyrics = '';
        this.percent = '';
        this.withFriend = false;
    }
}

const gameData = new GameData();

export { gameData };