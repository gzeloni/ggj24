async function createAccount(event) {
    event.preventDefault();
    const signupMessage = document.getElementById('signup-message');
    const username = document.getElementById('name').value;
    const useremail = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (password !== confirmPassword) {
        signupMessage.classList.add('alert-danger');
        signupMessage.innerText = 'As senhas não coincidem.';
        return;
    }
    const graphqlEndpoint = 'https://ggj24.gzeloni.dev/graphql/';

    const mutation = `
    mutation {
        signUp (input: {
            username: "${username}"
            email: "${useremail}"
            password: "${password}"
        }) {
            user {
                id
            }
        }
    }
    `;

    try {
        await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation }),
        });
        signupMessage.classList.add('alert-success');
        signupMessage.innerText = 'Conta criada com sucesso!';
        setTimeout(function(){location.href="./login.html"} , 500);   
    } catch (error) {
        signupMessage.classList.add('alert-danger');
        signupMessage.innerText = 'Erro ao criar a conta. Tente novamente.';
    }
}