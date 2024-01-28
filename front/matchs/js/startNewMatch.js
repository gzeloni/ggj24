function startNewMatch() {
    const matchName = document.getElementById('matchName').value;

    console.log('Nome da Nova Partida:', matchName);

    const modal = new bootstrap.Modal(document.getElementById('newMatchModal'));
    window.location.href = `../matchs/match.html?partida=${encodeURIComponent(matchName)}`;
}