async function loadScores() {
    let scores = [];
    try {
        const response = await fetch('/api/scores');
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
    while (table.firstChild) {
        table.removeChild(table.lastChild);
    }

    const data = await loadScores();
    const songTitle = document.querySelector('#scoreSearch').value;
    for (let i = 0; i < data.length; ++i) {
        if (String(data[i].title).toLowerCase() === String(songTitle).toLowerCase()) {
            createTableData(table, data[i]);
        }
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

    let amount = (data.length > 5) ? data.length - 5 : 0;
    console.log(amount);
    for (let i = data.length - 1; i >= amount; --i) {
        console.log(i);
        console.log(data[i]);
        createTableData(table, data[i]);
    }
}

displayRecentScores();

