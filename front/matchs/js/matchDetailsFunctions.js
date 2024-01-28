document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = decodeURIComponent(urlParams.get('reference'));

    const response = await fetch('https://ggj24.gzeloni.dev/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
            query {
                matches (reference_Icontains: "${reference}") {
                  id
                  memes {
                    id
                    meme
                    user {
                      id
                      username
                    }
                    score
                  }
                }
              }
            `,
        }),
    });

    const data = await response.json();
    const matchDetails = data.data.matches[0];

    document.getElementById('idCell').textContent = matchDetails.id;
    document.getElementById('referenceCell').textContent = reference;
    document.getElementById('participantsCountCell').textContent = matchDetails.memes.length;

    const memesContainer = document.getElementById('memesContainer');

    memesContainer.innerHTML = '';

    let currentRow;
    matchDetails.memes.forEach((meme, index) => {
        if (index % 4 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row';
            memesContainer.appendChild(currentRow);
        }

        const card = createMemeCard(meme);
        currentRow.appendChild(card);
    });

    createModals();
});

function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'col-md-3'; 

    const imageDataUrl = `${meme.meme}`;

    card.innerHTML = `
        <div class="card" data-id="${meme.id}">
            <img src="${imageDataUrl}" class="card-img-top" alt="Meme Image" style="width: 100%; height: auto;">
            <div class="card-body">
                <h5 class="card-title">Meme #${meme.id}</h5>
                <p class="card-text">Score: ${meme.score}</p>
                <p class="card-text">User: ${meme.user.username}</p>
            </div>
        </div>
    `;

    return card;
}

function createModals() {
    const participateModal = document.createElement('div');
    participateModal.innerHTML = `
        <div id="participateModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="participateModalLabel"
             aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="participateModalLabel">Participar da Partida</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Deseja participar desta partida? Você poderá enviar suas piadas.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="confirmParticipation()">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(participateModal);

    const votationModal = document.createElement('div');
    votationModal.innerHTML = `
        <div id="votationModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="votationModalLabel"
             aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="votationModalLabel">Votar na Piada</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="votationForm">
                            <p>Escolha uma note de 0 a 10 para esta joke:</p>
                            <input type="number" id="note" min="0" max="10" step="1" value="0" class="form-control">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="sendVote()">Enviar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(votationModal);

    const rankingModal = document.createElement('div');
    rankingModal.innerHTML = `
        <div id="rankingModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="rankingModalLabel"
             aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="rankingModalLabel">Ranking de Piadas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="rankingBody">
                        <!-- Conteúdo do ranking será adicionado aqui dinamicamente -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(rankingModal);
}

function openVoteModal(jokeID) {
    const modal = new bootstrap.Modal(document.getElementById('votationModal'));
    modal.show();
    document.getElementById('votationForm').dataset.jokeID = jokeID;
}

function sendVote() {
    const jokeID = document.getElementById('votationForm').dataset.jokeID;
    const note = document.getElementById('note').value;

    const joke = jokesData.find(p => p.id == jokeID);
    if (joke) {
        joke.votes += 1;
        joke.totalVotos += parseInt(note);

        const voteBtn = document.getElementById(`voteBtn-${jokeID}`);
        voteBtn.textContent = `Votar (${joke.votes})`;
    }

    const modal = new bootstrap.Modal(document.getElementById('votationModal'));
    modal.hide();
}

function showRanking() {
    const rankingBody = document.getElementById('rankingBody');
    rankingBody.innerHTML = '';

    const orderedJokes = [...jokesData].sort((a, b) => b.totalVotos - a.totalVotos);

    orderedJokes.forEach(joke => {
        const rankingItem = document.createElement('p');
        rankingItem.textContent = `Piada #${joke.id}: ${joke.totalVotos} pontos (${joke.votes} votos)`;
        rankingBody.appendChild(rankingItem);
    });

    const rankingModal = new bootstrap.Modal(document.getElementById('rankingModal'));
    rankingModal.show();
}

function confirmParticipation() {
    alert('Participação confirmada! Agora você pode enviar suas piadas para a partida.');
}
