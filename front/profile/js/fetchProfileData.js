async function fetchProfileData() {
    const response = await fetch('URL_DO_SEU_SERVIDOR_GRAPHQL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SEU_TOKEN_DE_AUTORIZACAO',
        },
        body: JSON.stringify({
            query: `
                query {
                    userProfile {
                        nome
                        username
                        partidas
                        melhorJogada
                        posicaoRanking
                        desempenhoPartidas {
                            numeroPartida
                            progresso
                        }
                        desempenhoJogadas {
                            numeroJogada
                            progresso
                        }
                    }
                }
            `,
        }),
    });

    const data = await response.json();
    return data.data.userProfile;
}

async function fillProfile() {
    const profileData = await fetchProfileData();

    // Preencher informações do perfil
    const profileInfo = document.getElementById('profile-info');
    profileInfo.innerHTML = `
        <h4>${profileData.nome}</h4>
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
                ${profileData.partidas}
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Melhor jogada</h6>
            </div>
            <div class="col-sm-9 text-secondary">
                <a href="${profileData.melhorJogada}">Detalhes</a>
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