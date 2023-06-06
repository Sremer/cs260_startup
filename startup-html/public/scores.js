async function loadScores() {
    let scores = [];
    try {
        const username = localStorage.getItem('username');
        const url = `/api/scores?username=${encodeURIComponent(username)}`;
        const response = await fetch(url);

        scores = await response.json();

        localStorage.setItem('scores', JSON.stringify(scores));

        return scores;
    } catch {
        scores = JSON.parse(localStorage.getItem('scores'));

        return scores;
    }
}

async function searchSong() {
    const table = document.getElementById('tableBody');
    const songTitle = document.querySelector('#scoreSearch').value;
    while (table.firstChild) {
        table.removeChild(table.lastChild);
    }

    const username = localStorage.getItem('username');
    const url = `/api/scoresTitle?username=${encodeURIComponent(username)}&title=${encodeURIComponent(songTitle)}`;
    const response = await fetch(url);

    scores = await response.json();
    for (let i = 0; i < scores.length; ++i) {
        console.log(scores[i]);
        createTableData(table, scores[i]);
    }
}

function createTableData(parent, score) {
    const title = document.createElement('th');
    title.textContent = score.title;
    console.log(score.title);
    const percent = document.createElement('th');
    percent.textContent = score.percent;
    const date = document.createElement('th');
    date.textContent = score.date;
    const time = document.createElement('th');
    time.textContent = score.time;

    const row = document.createElement('tr');
    row.appendChild(title);
    row.appendChild(percent);
    row.appendChild(date);
    row.appendChild(time);

    parent.appendChild(row);
}

async function displayRecentScores() {
    const data = await loadScores();
    const table = document.getElementById('tableBody');

    for (let i = 0; i < data.length; ++i) {
        createTableData(table, data[i]);
    }
}

function logout() {
    localStorage.removeItem('username');
    fetch(`/api/auth/logout`, {
      method: 'delete',
    }).then(() => (window.location.href = '/'));
}

displayRecentScores();

