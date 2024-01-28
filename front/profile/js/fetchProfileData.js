async function fetchProfileData() {
    let authToken = localStorage.getItem('authToken');
    const validateToken = await fetch('https://ggj24.gzeloni.dev/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${authToken}`,
        },
        body: JSON.stringify({
            query: `
            mutation {
                validateUserToken (token: "${authToken}") {
                  payload
                }
              }
            `,
        }),
    });
    let user = await validateToken.json();
    user = user.data.validateUserToken.payload.username;
    const response = await fetch('https://ggj24.gzeloni.dev/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${authToken}`,
        },
        body: JSON.stringify({
            query: `
            query {
                user (username: "${user}"){
                  id
                  username
                  avatar
                  dateJoined
                  memes {
                    id
                    meme
                    score
                    votes {
                      value
                    }
                  }
                }
              }
            `,
        }),
    });
    const data = await response.json();
    return data.data.user;
}

async function fillProfile() {
    const profileData = await fetchProfileData();

    // Preencher informações do perfil
    const profileInfo = document.getElementById('profile-info');
    profileInfo.innerHTML = `
        <h4>${profileData.username}</h4>
        <p class="text-secondary mb-1">@${profileData.username}</p>
        <button class="btn btn-primary">SEGUIR</button>
    `;

    // Preencher estatísticas do perfil
    const profileStats = document.getElementById('profile-stats');
    profileStats.innerHTML = `
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Partidas</h6>
            </div>
            <div class="col-sm-9 text-secondary">
                ${profileData.memes}
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Melhor jogada</h6>
            </div>
            <div class="col-sm-9 text-secondary">
                <a href="${profileData.memes}">Detalhes</a>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Posição no ranking</h6>
            </div>
            <div class="col-sm-9 text-secondary">
                #${profileData.posicaoRanking}
            </div>
        </div>
    `;

    // Preencher seção de desempenho
    const performanceSection = document.getElementById('performance-section');
    performanceSection.innerHTML = `
        <div class="col-sm-6 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6 class="d-flex align-items-center mb-3">Desempenho | Partidas</h6>
                    ${profileData.desempenhoPartidas.map(partida => `
                        <small>Partida N°${partida.numeroPartida}</small>
                        <div class="progress mb-3" style="height: 5px">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: ${partida.progresso}%" aria-valuenow="${partida.progresso}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="col-sm-6 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6 class="d-flex align-items-center mb-3">Desempenho | Jogadas</h6>
                    ${profileData.desempenhoJogadas.map(jogada => `
                        <small>Jogada N°${jogada.numeroJogada}</small>
                        <div class="progress mb-3" style="height: 5px">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: ${jogada.progresso}%" aria-valuenow="${jogada.progresso}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

fillProfile(); 