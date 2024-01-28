function sendNewJoke() {
    const newJokeTitle = document.getElementById('newJokeTitle').value;
    const newJokeContent = document.getElementById('newJokeContent').value;

    const newCard = document.createElement('div');
    newCard.className = 'card mt-3';
    newCard.innerHTML = `
<div class="card-body">
    <h5 class="card-title">${newJokeTitle}</h5>
    <p class="card-text">${newJokeContent}</p>
</div>
`;

    const timeline = document.getElementById('timeline');
    timeline.appendChild(newCard);

    newJokeTitle = ""
    newJokeContent = ""
    const modal = new bootstrap.Modal();
    modal.close();
}
const urlParams = new URLSearchParams(window.location.search);
const matchName = urlParams.get('partida');

document.getElementById('matchName').textContent = matchName;