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
        "auth/invalid-login-credentials": "帳號或密碼錯誤。",
    };
    return errorMessages[code] || "發生未知錯誤：" + code;
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 切換介面
function togglePage() {
    let loginPage = document.getElementById('loginPage');
    let registerPage = document.getElementById('registerPage');
    let loginElements = loginPage.querySelectorAll('h2, input, button, a, p');
    let registerElements = registerPage.querySelectorAll('h2, input, button, a, p');
    const container = document.querySelector(".container");

    if (loginPage.style.display === 'none') {
        // 從註冊切到登入
        container.classList.remove("expand2");
        container.classList.add("expand3");

        registerElements.forEach(element => element.classList.remove('visible'));
        registerElements.forEach(element => element.classList.add('hidden'));

        setTimeout(() => {
            registerPage.style.display = 'none';
            loginPage.style.display = 'block';
            loginElements.forEach(element => element.classList.remove('hidden'));
            loginElements.forEach(element => element.classList.add('visible'));
        }, 300);

        document.querySelectorAll("input").forEach(input => input.value = "");
        document.getElementById("RegisterMessage").innerText = "";
        document.getElementById("LoginMessage").innerText = "";
    } else {
        // 從登入切到註冊
        container.classList.remove("expand3");
        container.classList.add("expand2");

        loginElements.forEach(element => element.classList.remove('visible'));
        loginElements.forEach(element => element.classList.add('hidden'));

        setTimeout(() => {
            loginPage.style.display = 'none';
            registerPage.style.display = 'block';
            registerElements.forEach(element => element.classList.remove('hidden'));
            registerElements.forEach(element => element.classList.add('visible'));
        }, 300);
    }
}

// 註冊功能
function register() {
    let username = document.getElementById("registerUsername").value;
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;

    if (!username || !email || !password) {
        document.getElementById("RegisterMessage").innerText = "請輸入完整資訊！";
        document.getElementById("RegisterMessage").className = "message-error";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            try {
                await setDoc(doc(db, "users", user.uid), {
                    userName: username,
                    email: user.email,
                    createdAt: new Date()
                });

                document.getElementById("RegisterMessage").innerText = "註冊成功！請前往登入。";
                document.getElementById("RegisterMessage").className = "message-success";
                setTimeout(() => {
                    togglePage(); // 自動切換回登入頁面
                }, 1000);
            } catch (firestoreError) {
                console.error("Firestore 儲存錯誤:", firestoreError);
                document.getElementById("RegisterMessage").innerText = "註冊成功，但資料儲存失敗！";
                document.getElementById("RegisterMessage").className = "message-error";
            }
        })
        .catch((error) => {
            let errorMessage = translateErrorCode(error.code);
            document.getElementById("RegisterMessage").innerText = errorMessage;
            document.getElementById("RegisterMessage").className = "message-error";
        });
}

// 登入功能
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            localStorage.removeItem("userUID");
            localStorage.setItem("userUID", user.uid);//儲存登入者uid

            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userName = docSnap.data().userName;
                    document.getElementById("LoginMessage").innerText = `登入成功！歡迎，${userName}！`;
                } else {
                    document.getElementById("LoginMessage").innerText = `登入成功！歡迎，使用者！`;
                }
            } catch (e) {
                document.getElementById("LoginMessage").innerText = `登入成功！歡迎，使用者！`;
            }
            
            document.getElementById("LoginMessage").className = "message-success";

            setTimeout(() => {
                const container = document.querySelector(".container");
                const elementsToHide = container.querySelectorAll("input, h2, button, a, p");
                elementsToHide.forEach(element => element.classList.remove('visible'));
                elementsToHide.forEach(element => element.classList.add("hidden"));
                container.classList.remove("expand3");
                container.classList.add("expand");

                setTimeout(() => {
                    window.location.href = "https://harrylin0312.github.io/face-recognition/start/";
                }, 1500);
            }, 1000);
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
