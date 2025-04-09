// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDRL_2uAJD63ALwp2uNtAnakA4BayVl30",
    authDomain: "face-recognition-556ed.firebaseapp.com",
    projectId: "face-recognition-556ed",
    storageBucket: "face-recognition-556ed.firebasestorage.app",
    messagingSenderId: "614926935705",
    appId: "1:614926935705:web:57d56d7115a6504497fa08",
    measurementId: "G-YXSM0L5Z83"
};

// 錯誤碼轉換函數
function translateErrorCode(code) {
    const errorMessages = {
        "auth/email-already-in-use": "此Email已被註冊。",
        "auth/invalid-email": "Email格式錯誤。",
        "auth/weak-password": "密碼至少需要6個字元。",
        "auth/user-not-found": "找不到此帳號。",
        "auth/wrong-password": "密碼錯誤。",
        "auth/missing-password": "請輸入密碼。",
        "auth/too-many-requests": "嘗試次數過多，請稍後再試。",
        "auth/network-request-failed": "網路連線錯誤，請檢查您的網路。",
        "auth/internal-error": "伺服器內部錯誤，請稍後再試。",
        "auth/operation-not-allowed": "目前不允許此操作，請聯繫管理員。",
        "auth/invalid-credential": "登入憑證無效，請重新輸入。",
    };
    return errorMessages[code] || "發生未知錯誤：" + code;
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // 初始化 Firestore

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
        }, 300); // 等待淡出完成 (0.3秒)
    document.querySelectorAll("input").forEach(input => input.value = "");//清空輸入框
    document.getElementById("RegisterMessage").innerText = "";//清空錯誤訊息
    document.getElementById("LoginMessage").innerText = "";
    } else {
        // 從登入切到註冊
        loginElements.forEach(element => element.classList.remove('visible'));
        loginElements.forEach(element => element.classList.add('hidden'));
        setTimeout(() => {
            loginPage.style.display = 'none';
            registerPage.style.display = 'block';
            registerElements.forEach(element => element.classList.remove('hidden'));
            registerElements.forEach(element => element.classList.add('visible'));
        }, 300); // 等待淡出完成 (0.3秒)
    }
}

// 註冊功能
async function register() {
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;
    const username = document.getElementById("registerUsername").value; // 新增使用者名稱

    if (!email || !password || !username) {
        document.getElementById("RegisterMessage").innerText = "請輸入完整資訊！";
        document.getElementById("RegisterMessage").className = "message-error";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // 註冊成功
            const uid = userCredential.user.uid;
            await setDoc(doc(db, "users", uid), { username }); // 儲存使用者名稱
            document.getElementById("RegisterMessage").innerText = "註冊成功！請前往登入。";
            document.getElementById("RegisterMessage").className = "message-success";
            setTimeout(() => {
                togglePage(); // 自動切換回登入頁面
            }, 1000); // 1秒後跳轉到登入頁面
        })
        .catch((error) => {
            let errorMessage = translateErrorCode(error.code);
            document.getElementById("RegisterMessage").innerText = errorMessage;
            document.getElementById("RegisterMessage").className = "message-error";
        });
}

// 登入功能
async function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // 登入成功
            const uid = userCredential.user.uid;
            const docSnap = await getDoc(doc(db, "users", uid)); // 讀取使用者名稱
            let username = "";
            if (docSnap.exists()) {
                username = docSnap.data().username || "";
            }
            document.getElementById("LoginMessage").innerText = `登入成功！歡迎 ${username}`; // 顯示歡迎訊息

            setTimeout(() => {
                const container = document.querySelector(".container");
                const elementsToHide = container.querySelectorAll("input, h2, button, a, p");
                 // 給所有指定的元素加上 'hidden' 類別
                 
                elementsToHide.forEach(element => element.classList.remove('visible'));
                elementsToHide.forEach(element => element.classList.add("hidden"));

                container.classList.add("expand"); // 0.5 秒後觸發動畫
            
                setTimeout(() => {
                    window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
                    // window.location.href = "file:///Users/linhengyu/Downloads/code/HTML/專案/start/index.html";
                }, 1500);
            }, 500);
        })
        .catch((error) => {
            let errorMessage = translateErrorCode(error.code);
            document.getElementById("LoginMessage").innerText = errorMessage;
            document.getElementById("LoginMessage").className = "message-error";
        });
}

// 監聽 Enter 鍵以執行登入
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login(); // 呼叫登入函數
        register();//呼叫註冊函數
    }
});

// 回退強制重整強制重整
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });

// 將函數暴露給全局，以便 HTML 事件處理器使用
window.togglePage = togglePage;
window.register = register;
window.login = login;
