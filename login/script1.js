// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDRL_2uAJD63ALwp2uNtAnakA4BayVl30",
    authDomain: "face-recognition-556ed.firebaseapp.com",
    projectId: "face-recognition-556ed",
    storageBucket: "face-recognition-556ed.firebasestorage.app",
    messagingSenderId: "614926935705",
    appId: "1:614926935705:web:57d56d7115a6504497fa08",
    measurementId: "G-YXSM0L5Z83"
  };

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 切換介面
function togglePage() {
    let loginPage = document.getElementById('loginPage');
    let registerPage = document.getElementById('registerPage');
    let loginElements = loginPage.querySelectorAll('h2, input, button, a, p');
    let registerElements = registerPage.querySelectorAll('h2, input, button, a, p');

    if (loginPage.style.display === 'none') {
        // 從註冊切到登入
        registerElements.forEach(element => element.classList.remove('visible'));
        registerElements.forEach(element => element.classList.add('hidden'));
        setTimeout(() => {
            registerPage.style.display = 'none';
            loginPage.style.display = 'block';
            loginElements.forEach(element => element.classList.remove('hidden'));
            loginElements.forEach(element => element.classList.add('visible'));
        }, 500); // 等待淡出完成 (0.5秒)
    } else {
        // 從登入切到註冊
        loginElements.forEach(element => element.classList.remove('visible'));
        loginElements.forEach(element => element.classList.add('hidden'));
        setTimeout(() => {
            loginPage.style.display = 'none';
            registerPage.style.display = 'block';
            registerElements.forEach(element => element.classList.remove('hidden'));
            registerElements.forEach(element => element.classList.add('visible'));
        }, 500); // 等待淡出完成 (0.5秒)
    }
}

// 註冊功能
function register() {
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;

    if (!email || !password) {
        document.getElementById("RegisterMessage").innerText = "請輸入完整資訊！";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // 註冊成功
            document.getElementById("RegisterMessage").innerText = "註冊成功！請前往登入。";
            setTimeout(() => {
                togglePage(); // 自動切換回登入頁面
            }, 1000); // 1秒後跳轉到登入頁面
        })
        .catch((error) => {
            // 處理錯誤
            let errorMessage = error.message;
            document.getElementById("RegisterMessage").innerText = errorMessage;
        });
}

// 登入功能
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // 登入成功
            document.getElementById("LoginMessage").innerText = "登入成功！";

            setTimeout(() => {
                const container = document.querySelector(".container");
                const elementsToHide = container.querySelectorAll("input, h2, button, a, p");
                // 給所有指定的元素加上 'hidden' 類別
                elementsToHide.forEach(element => element.classList.add("hidden"));
                
                container.classList.add("expand"); // 0.5 秒後觸發動畫
            
                setTimeout(() => {
                    // 根據你的需求，這裡可以改成線上 URL 或本地檔案路徑
                    window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
                    // window.location.href = "file:///Users/linhengyu/Downloads/code/HTML/專案/start/index.html";
                }, 1500);
            }, 500);
        })
        .catch((error) => {
            // 處理錯誤
            let errorMessage = error.message;
            document.getElementById("LoginMessage").innerText = errorMessage;
        });
}

// 監聽 Enter 鍵以執行登入
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login(); // 呼叫登入函數
    }
});

// 將函數暴露給全局，以便 HTML 事件處理器使用
window.togglePage = togglePage;
window.register = register;
window.login = login;
