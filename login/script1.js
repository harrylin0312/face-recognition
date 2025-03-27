// 切換登入或註冊頁面
function togglePage() {
    let loginPage = document.getElementById('loginPage');
    let registerPage = document.getElementById('registerPage');

    // 切換 display 屬性（顯示/隱藏效果）
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

//註冊功能
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
        togglePage(); // 自動切換回登入頁面
    }, 1000); // 1秒後跳轉到登入頁面
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
    document.getElementById("message").innerText = "登入成功！";

    setTimeout(() => {
        const container = document.querySelector(".container");
        const elementsToHide = container.querySelectorAll("input, h2, button, a, p");
        // 給所有指定的元素加上 'hidden' 類別
        elementsToHide.forEach(element => element.classList.add ("hidden"));
            
        
        container.classList.add("expand"); // 0.5 秒後觸發動畫
    
        setTimeout(() => {
            window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
        }, 1400);
    }, 500);
}
