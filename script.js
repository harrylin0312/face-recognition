// 切換登入與註冊頁面
function togglePage() {
    let loginPage = document.getElementById('loginPage');
    let registerPage = document.getElementById('registerPage');

    if (loginPage.style.display === 'none') {
        loginPage.style.display = 'block';
        registerPage.style.display = 'none';
    } else {
        loginPage.style.display = 'none';
        registerPage.style.display = 'block';
    }

    // 清除訊息
    document.getElementById('message').innerText = "";
}

// 註冊功能
function register() {
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;

    if (!email || !password) {
        document.getElementById("message").innerText = "請輸入完整資訊！";
        return;
    }

    if (localStorage.getItem(email)) {
        document.getElementById("message").innerText = "此帳戶已被註冊！";
        return;
    }

    localStorage.setItem(email, password);
    document.getElementById("message").innerText = "註冊成功！請前往登入。";

    setTimeout(() => {
        togglePage();
    }, 1000);
}

// 登入功能
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    let storedPassword = localStorage.getItem(email);

    if (!storedPassword) {
        document.getElementById("message").innerText = "帳戶不存在！請註冊。";
        return;
    }

    if (storedPassword !== password) {
        document.getElementById("message").innerText = "密碼錯誤！請重試。";
        return;
    }

    document.getElementById("message").innerText = "登入成功！";
    setTimeout(() => {
        alert("歡迎 " + email + "，您已成功登入！");
        window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
    }, 1000);
}