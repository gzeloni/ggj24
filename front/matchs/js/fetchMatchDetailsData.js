let idValue;

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    idValue = urlParams.get("id");
    const reference = urlParams.get("reference");
    const response = await fetch('http://104.237.1.145:5024/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
            query {
                matches(reference_Icontains: "${reference}") {
                    reference
                    id
                    participantsCount
                    datetimeOpen
                    isOpen
                    hoster {
                        username
                        dateJoined
                    }
                }
            }
            `,
        }),
    });
    const data = await response.json();
    const matchDetails = data.data.matches[0];



    document.getElementById("idCell").textContent = idValue;
    document.getElementById("referenceCell").textContent = reference;
    document.getElementById("participantsCountCell").textContent = matchDetails.participantsCount;
    document.getElementById("datetimeOpenCell").textContent = matchDetails.datetimeOpen;
    document.getElementById("isOpenCell").textContent = matchDetails.isOpen;
    document.getElementById("hosterUsernameCell").textContent = matchDetails.hoster.username;
    document.getElementById("hosterDateJoinedCell").textContent = matchDetails.hoster.dateJoined;
});

const exportButton = document.querySelector('.export-button');
exportButton.addEventListener('click', function () {
    // Now you can use the idValue variable here
    console.log("ID value:", idValue);
});