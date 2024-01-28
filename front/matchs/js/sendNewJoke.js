async function sendNewJoke(blob, matchId) {
    const newJokeMatchIdElement = document.getElementById('newJokeMatchId');
    const matchId = newJokeMatchIdElement.value;
    let authToken = localStorage.getItem('authToken');

    document.getElementById('newJokeContent').value = "";

    try {
        await fetch('https://ggj24.gzeloni.dev/graphql/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${authToken}`,
            },
            body: JSON.stringify({
                query: `
                  mutation {
                      enterMatch(input: {
                          matchId: "${matchId}"
                      }) {
                          clientMutationId
                      }
                  }
              `
            }),
        });

        // Envia a nova piada
        const response = await fetch('https://ggj24.gzeloni.dev/graphql/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${authToken}`,
            },
            body: JSON.stringify({
                query: `
                  mutation {
                      sendMeme(input: {
                          matchId: "${matchId}",
                          data: "${blob}"
                      }) {
                          meme {
                              id
                              user {
                                  id
                                  username
                              }
                              meme
                              score
                          }
                      }
                  }
              `
            }),
        });

        // Verifica se a requisição foi bem-sucedida antes de fechar o modal
        if (response.ok) {
            const modal = new bootstrap.Modal(document.getElementById('sendJokeModal'));
            modal.hide();
        } else {
            console.error('Erro ao enviar a nova piada.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}
const urlParams = new URLSearchParams(window.location.search);
const matchName = urlParams.get('partida');
document.getElementById('matchName').textContent = matchName;