function sendJoke() {
    const jokeTitle = document.getElementById('jokeTitle').value;
    const jokeContent = document.getElementById('jokeContent').value;

    console.log('Título da Piada/Meme:', jokeTitle);
    console.log('Conteúdo da Piada/Meme:', jokeContent);

    document.getElementById('jokeTitle').value = '';
    document.getElementById('jokeContent').value = '';

    fillTimeline();
}

function sendVote() {
    const voteNote = document.getElementById('voteNote').value;

    console.log('Nota do Voto:', voteNote);

    document.getElementById('voteNote').value = '';

    fillTimeline();
}

function fillTimeline() {
}

fillTimeline();