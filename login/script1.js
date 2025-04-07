// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase 設定
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

// 封裝功能到一個物件，避免全域污染
const authApp = {
    // 切換頁面功能
    togglePage() {
        const loginPage = document.getElementById("loginPage");
        const registerPage = document.getElementById("registerPage");
        const loginElements = loginPage.querySelectorAll("h2, input, button, a, p");
        const registerElements = registerPage.querySelectorAll("h2, input, button, a, p");

        if (loginPage.style.display === "none") {
            // 從註冊切到登入
            registerElements.forEach(element => element.classList.remove("visible"));
            registerElements.forEach(element => element.classList.add("hidden"));
            setTimeout(() => {
                registerPage.style.display = "none";
                loginPage.style.display = "block";
                loginElements.forEach(element => element.classList.remove("hidden"));
                loginElements.forEach(element => element.classList.add("visible"));
            }, 500); // 等待淡出完成 (0.5秒)
        } else {
            // 從登入切到註冊
            loginElements.forEach(element => element.classList.remove("visible"));
            loginElements.forEach(element => element.classList.add("hidden"));
            setTimeout(() => {
                loginPage.style.display = "none";
                registerPage.style.display = "block";
                registerElements.forEach(element => element.classList.remove("hidden"));
                registerElements.forEach(element => element.classList.add("visible"));
            }, 500); // 等待淡出完成 (0.5秒)
        }
    },

    // 註冊功能
    register() {
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        if (!email || !password) {
            document.getElementById("RegisterMessage").innerText = "請輸入完整資訊！";
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                document.getElementById("RegisterMessage").innerText = "註冊成功！請前往登入。";
                setTimeout(() => this.togglePage(), 1000); // 1秒後切換回登入頁面
            })
            .catch((error) => {
                document.getElementById("RegisterMessage").innerText = error.message;
            });
    },

    // 登入功能
    login() {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                document.getElementById("LoginMessage").innerText = "登入成功！";
                setTimeout(() => {
                    const container = document.querySelector(".container");
                    const elementsToHide = container.querySelectorAll("input, h2, button, a, p");
                    elementsToHide.forEach(element => element.classList.add("hidden"));
                    container.classList.add("expand");
                    setTimeout(() => {
                        window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
                    }, 1500);
                }, 500);
            })
            .catch((error) => {
                document.getElementById("LoginMessage").innerText = error.message;
            });
    },

    // 初始化事件監聽器
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            // 綁定登入按鈕
            document.querySelector("#loginPage button").addEventListener("click", () => this.login());
            // 綁定註冊按鈕
            document.querySelector("#registerPage button").addEventListener("click", () => this.register());
            // 綁定登入頁的切換連結
            document.querySelector("#loginPage a").addEventListener("click", (e) => {
                e.preventDefault();
                this.togglePage();
            });
            // 綁定註冊頁的切換連結
            document.querySelector("#registerPage a").addEventListener("click", (e) => {
                e.preventDefault();
                this.togglePage();
            });
            // 綁定 Enter 鍵觸發登入
            document.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.login();
                }
            });
        });
    }
};

// 啟動應用
authApp.init();
