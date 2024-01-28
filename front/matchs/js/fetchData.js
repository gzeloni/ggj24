async function fetchData() {
  const response = await fetch('URL_DO_GRAPHQL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer TOKEN',
    },
    body: JSON.stringify({
      query: `
          `,
    }),
  });

  const data = await response.json();
  return data.data;
}

async function fillTables() {
  const data = await fetchData();
  fillTable('TODO', data.topPartidas);
  fillTable('TODO', data.partidasEmAndamento);
}

function fillTable(tableId, rows) {
  const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  table.innerHTML = '';

  rows.forEach(row => {
    const newRow = table.insertRow();
    const idCell = newRow.insertCell(0);
    const cellName = newRow.insertCell(1);
    const playersCell = newRow.insertCell(2);
    const detailsCell = newRow.insertCell(3);

    idCell.textContent = row.id;
    cellName.textContent = row.nome;
    playersCell.textContent = row.jogadores;

    // Adiciona um evento de clique ao link "Detalhes"
    const linkDetails = document.createElement('a');
    linkDetails.href = '#';
    linkDetails.textContent = 'Detalhes';
    linkDetails.addEventListener('click', () => showModalDetails(row));
    detailsCell.appendChild(linkDetails);
  });
}

function showModalDetails(partida) {
  document.getElementById('IDDetails').textContent = partida.id;
  document.getElementById('nameDetails').textContent = partida.nome;
  document.getElementById('playersDetails').textContent = partida.jogadores;

  const modalDetails = new bootstrap.Modal(document.getElementById('modalDetails'));
  modalDetails.show();
}

fillTables();