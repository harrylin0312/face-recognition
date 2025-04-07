// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// 切換登入/註冊頁面
function togglePage() {
  const loginPage = document.getElementById("loginPage");
  const registerPage = document.getElementById("registerPage");
  const loginElements = loginPage.querySelectorAll("h2, input, button, a, p");
  const registerElements = registerPage.querySelectorAll("h2, input, button, a, p");

  if (loginPage.style.display === "none") {
    // 註冊切回登入
    registerElements.forEach(el => el.classList.replace("visible", "hidden"));
    setTimeout(() => {
      registerPage.style.display = "none";
      loginPage.style.display = "block";
      loginElements.forEach(el => el.classList.replace("hidden", "visible"));
    }, 500);
  } else {
    // 登入切到註冊
    loginElements.forEach(el => el.classList.replace("visible", "hidden"));
    setTimeout(() => {
      loginPage.style.display = "none";
      registerPage.style.display = "block";
      registerElements.forEach(el => el.classList.replace("hidden", "visible"));
    }, 500);
  }
}

// 註冊功能
function register() {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!email || !password) {
    document.getElementById("RegisterMessage").innerText = "請輸入完整資訊！";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("RegisterMessage").innerText = "註冊成功！請前往登入。";
      setTimeout(togglePage, 1000);
    })
    .catch((error) => {
      document.getElementById("RegisterMessage").innerText = error.message;
    });
}

// 登入功能
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("LoginMessage").innerText = "登入成功！";

      setTimeout(() => {
        const container = document.querySelector(".container");
        const elementsToHide = container.querySelectorAll("input, h2, button, a, p");
        elementsToHide.forEach(el => el.classList.add("hidden"));
        container.classList.add("expand");

        setTimeout(() => {
          window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
        }, 1500);
      }, 500);
    })
    .catch((error) => {
      document.getElementById("LoginMessage").innerText = error.message;
    });
}

//當 DOM 載入完再掛事件（避免找不到元素）
document.addEventListener("DOMContentLoaded", () => {
  // 綁定登入按鈕
  document.querySelector("#loginPage button").addEventListener("click", login);

  // 綁定註冊按鈕
  document.querySelector("#registerPage button").addEventListener("click", register);

  // 綁定登入區的切換連結
  document.querySelector("#loginPage a").addEventListener("click", (e) => {
    e.preventDefault();
    togglePage();
  });

  // 綁定註冊區的切換連結
  document.querySelector("#registerPage a").addEventListener("click", (e) => {
    e.preventDefault();
    togglePage();
  });

  // 綁定 Enter 鍵觸發登入
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      login();
    }
  });
});
