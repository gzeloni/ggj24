async function fetchData() {
  let authToken = localStorage.getItem('authToken');
  if (authToken == null) {
    console.error('Token de autenticação ausente. Redirecionando para a página de login.');
    window.location.href = "../login/login.html";
  }

  const response = await fetch('https://ggj24.gzeloni.dev/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`,
    },
    body: JSON.stringify({
      query: `
          query {
            matches {
              id
              reference
              participantsCount
            }
          }
          `,
    }),
  });

  const data = await response.json();
  console.log(data)
  return data.data;
}

async function fillTables() {
  const data = await fetchData();

  if (data && data.matches) {
    fillTable('topMatchsTable', data.matches);
    fillTable('runningMatchsTable', data.matches);
  }
}

function fillTable(tableId, rows) {
  const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  table.innerHTML = '';

  rows.forEach(row => {
    const newRow = table.insertRow();
    const idCell = newRow.insertCell(0);
    const referenceCell = newRow.insertCell(1);
    const participantsCountCell = newRow.insertCell(2);
    const detailsCell = newRow.insertCell(3);

    idCell.textContent = row.id;
    referenceCell.textContent = row.reference;
    participantsCountCell.textContent = row.participantsCount;

    let linkDetails = document.createElement('a');
    linkDetails.textContent = 'Detalhes';
    linkDetails.addEventListener('click', async (event) => {
      event.preventDefault();

      const response = await fetch('https://ggj24.gzeloni.dev/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
                    query {
                        matches(reference_Icontains: "${row.reference}") {
                          reference
                          id
                          participantsCount
                          datetimeOpen
                          isOpen
                          hoster {
                            username
                            avatar
                            dateJoined
                          }
                        }
                    }
                `,
        }),
      });
      const data = await response.json();
      const matchDetails = data.data.matches[0];
      linkDetails.href = `../matchs/matchDetails.html?id=${matchDetails.id}&reference=${matchDetails.reference}`;
      window.location.href = linkDetails.href;
    });

    detailsCell.appendChild(linkDetails);
  });

}


function showModalDetails(partida) {
  document.getElementById('IDDetails').textContent = partida.id;
  document.getElementById('nameDetails').textContent = partida.reference;
  document.getElementById('playersDetails').textContent = partida.participantsCount;

  const modalDetails = new bootstrap.Modal(document.getElementById('modalDetails'));
  modalDetails.show();
}

fillTables();