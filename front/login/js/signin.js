async function login() {
    const useremail = document.getElementById('useremail').value;
    const password = document.getElementById('password').value;

    const graphqlEndpoint = 'https://ggj24.gzeloni.dev/graphql/';

    const mutation = `
        mutation {
            signIn (input: {
            email: "${useremail}"
            password: "${password}"
        }) {
            token
        }
    }
    `;

    try {
        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation }),
        });

        const result = await response.json();
        if (result.data.signIn && result.data.signIn.token) {
            localStorage.setItem('authToken', result.data.signIn.token);
            window.location.href = "../matchs/home.html";
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição GraphQL:', error);
    }
}