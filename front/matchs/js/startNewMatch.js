async function startNewMatch() {
    const matchName = document.getElementById('matchName').value;
    let authToken = localStorage.getItem('authToken');
    var isoDateString = new Date().toISOString();
    const data = await fetch('http://104.237.1.145:5024/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${authToken}`,
        },
        body: JSON.stringify({
            query: `
            mutation {
                createMatch (input: {
                  reference: "${matchName}"
                  datetimeOpen: "${isoDateString}"
                }) {
                  memeMatch {
                    id
                    reference
                    datetimeOpen
                    isOpen
                    hoster {
                      id
                      username
                      avatar
                      dateJoined
                      memes {
                        id
                        meme
                        score
                        votes {
                          user {
                            id
                            username
                            dateJoined
                          }
                          memePlay {
                            id
                            user {
                              id
                              username
                              dateJoined
                            }
                          }
                        }
                      }
                    }
                    participants {
                      id
                      username
                      dateJoined
                    }
                    participantsCount
                  }
                }
              }
            `,
        }),
    });
    response = await data.json();
    console.log(response);

    const modal = new bootstrap.Modal(document.getElementById('newMatchModal'));
    setTimeout(location.reload.bind(location), 1000);
}