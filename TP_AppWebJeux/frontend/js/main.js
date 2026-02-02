document.addEventListener('DOMContentLoaded', () => {

    const ctaButton = document.getElementById('cta-button');
    if(ctaButton) {
        ctaButton.addEventListener('click', () => {
            window.location.href = 'games.html';
        });
    }

    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const linkShowRegister = document.getElementById('show-register');
    const linkShowLogin = document.getElementById('show-login');
    const authMessage = document.getElementById('auth-message');

    if (linkShowRegister && linkShowLogin) {
        linkShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.classList.add('hidden');
            registerBox.classList.remove('hidden');
            authMessage.textContent = "";
        });

        linkShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
            authMessage.textContent = "";
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-password-confirm').value;

            if (!emailRegex.test(email)) {
                authMessage.style.color = "red";
                authMessage.textContent = "Format d'email invalide.";
                return;
            }

            if (password.length < 6) {
                authMessage.style.color = "red";
                authMessage.textContent = "Le mot de passe doit faire au moins 6 caractères.";
                return;
            }

            if (password !== confirmPassword) {
                authMessage.style.color = "red";
                authMessage.textContent = "Les mots de passe ne correspondent pas.";
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userExists = users.find(u => u.email === email);

            if (userExists) {
                authMessage.style.color = "red";
                authMessage.textContent = "Cet email est déjà utilisé.";
            } else {
                const newUser = {
                    email: email,
                    password: password,
                    dateInscription: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                authMessage.style.color = "#4caf50";
                authMessage.textContent = "Inscription réussie ! Connectez-vous.";
                
                setTimeout(() => {
                    registerBox.classList.add('hidden');
                    loginBox.classList.remove('hidden');
                    authMessage.textContent = "";
                }, 1500);
            }
        });
    }

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                const sessionData = {
                    email: user.email,
                    isConnected: true,
                    loginDate: new Date().toISOString()
                };
                sessionStorage.setItem('userSession', JSON.stringify(sessionData));

                authMessage.style.color = "#4caf50";
                authMessage.textContent = "Connexion réussie ! Redirection...";
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } else {
                authMessage.style.color = "red";
                authMessage.textContent = "Email ou mot de passe incorrect.";
            }
        });
    }
});