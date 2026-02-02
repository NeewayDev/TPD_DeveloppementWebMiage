document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION ÉTAT CONNEXION (GLOBAL) ---
    const userSession = JSON.parse(sessionStorage.getItem('userSession'));
    const navLoginBtn = document.querySelector('.btn-login');

    // 1. Mise à jour Header
    if (userSession && userSession.isConnected) {
        if (navLoginBtn) {
            navLoginBtn.textContent = "👤 " + userSession.email.split('@')[0];
            navLoginBtn.href = "login.html";
            navLoginBtn.classList.add('connected'); // Ajoute la classe CSS spécifique
        }
    }

    // 2. Mise à jour Page Login
    const authContainer = document.getElementById('auth-container');
    const loggedInContainer = document.getElementById('user-logged-in');
    const userEmailDisplay = document.getElementById('user-email-display');
    const btnLogout = document.getElementById('btn-logout');

    if (authContainer && loggedInContainer && userSession && userSession.isConnected) {
        authContainer.classList.add('hidden');
        loggedInContainer.classList.remove('hidden');
        userEmailDisplay.textContent = userSession.email;

        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                sessionStorage.removeItem('userSession');
                window.location.reload();
            });
        }
    }

    // --- NAVIGATION ---
    const ctaButton = document.getElementById('cta-button');
    if(ctaButton) {
        ctaButton.addEventListener('click', () => window.location.href = 'games.html');
    }

    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const linkShowRegister = document.getElementById('show-register');
    const linkShowLogin = document.getElementById('show-login');
    const authMessage = document.getElementById('auth-message');

    function setMessage(text, type) {
        if(!authMessage) return;
        
        authMessage.textContent = text;
        authMessage.classList.remove('msg-success', 'msg-error');

        if (type === 'success') authMessage.classList.add('msg-success');
        if (type === 'error') authMessage.classList.add('msg-error');
    }

    if (linkShowRegister && linkShowLogin) {
        linkShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.classList.add('hidden');
            registerBox.classList.remove('hidden');
            setMessage("", "reset");
        });

        linkShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
            setMessage("", "reset");
        });
    }

    const formRegister = document.getElementById('form-register');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-password-confirm').value;

            if (!emailRegex.test(email)) return setMessage("Format d'email invalide.", "error");
            if (password.length < 6) return setMessage("Le mot de passe doit faire au moins 6 caractères.", "error");
            if (password !== confirmPassword) return setMessage("Les mots de passe ne correspondent pas.", "error");

            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            if (users.find(u => u.email === email)) {
                setMessage("Cet email est déjà utilisé.", "error");
            } else {
                users.push({ email, password, dateInscription: new Date().toISOString() });
                localStorage.setItem('users', JSON.stringify(users));
                
                setMessage("Inscription réussie ! Redirection vers la connexion...", "success");
                
                setTimeout(() => {
                    registerBox.classList.add('hidden');
                    loginBox.classList.remove('hidden');
                    setMessage("", "reset");
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
                
                setMessage("Connexion réussie !", "success");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setMessage("Email ou mot de passe incorrect.", "error");
            }
        });
    }
});