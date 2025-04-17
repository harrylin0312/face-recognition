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

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 頁面載入時觸發淡入效果
document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('mainMenu');
    const elements = mainMenu.querySelectorAll('h2, input, button:not(.back-button), div, a');
    elements.forEach(element => element.classList.add('fade-in')); // 觸發初次淡入
    setTimeout(() => {
        elements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
        loadUserName();
    }, 300); // 動畫完成後清除
});

// 切換介面
function toggleSection(sectionId) {
    const allContainers = document.querySelectorAll('.container');
    const nextSection = document.getElementById(sectionId);

    allContainers.forEach(container => {
        if (!container.classList.contains('hidden')) {
            const elements = container.querySelectorAll('h2, input, button:not(.back-button), div, a');
            elements.forEach(element => element.classList.add('fade-out')); // 觸發淡出
            setTimeout(() => {
                container.classList.add('hidden');
                elements.forEach(element => element.classList.remove('fade-out')); // 清除淡出類別
            }, 300); // 等待淡出完成
        }
    });
    document.querySelectorAll("input").forEach(input => input.value = "");

    setTimeout(() => {
        nextSection.classList.remove('hidden');
        const nextElements = nextSection.querySelectorAll('h2, input, button:not(.back-button), div, a');
        nextElements.forEach(element => element.classList.add('fade-in')); // 觸發淡入
        setTimeout(() => {
            nextElements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
        }, 500); // 清除動畫類別
        if (sectionId === 'checkInRecord') {
            loadCheckInRecords();
        }
        if (sectionId === 'manageEvent') {
            loadEventManagement();
        }
    }, 300); // 與淡出時間同步
}

//舉辦活動
function createEvent() {
    let eventName = document.getElementById('eventName').value;
    if (!eventName) {
        alert('請輸入活動名稱');
        return;
    }
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push({ name: eventName, members: [] });
    localStorage.setItem('events', JSON.stringify(events)); 
    alert('活動已建立');
    document.getElementById('eventName').value = '';
    loadEventManagement();
}

//加入活動
function joinEvent() {
    let eventCode = document.getElementById('eventCode').value;
    if (!eventCode) {
        alert('請輸入活動代碼');    
        return;
    }
    let joinedEvents = JSON.parse(localStorage.getItem('joinedEvents')) || [];
    joinedEvents.push({ name: eventCode, status: "未打卡" });
    localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents)); 
    alert('成功加入活動');
}

async function loadUserName() {
    userIDElement.textContent = '載入中…';
    userIDElement.className = '';
    const userUID = localStorage.getItem("userUID");
    // 其他邏輯
}

function loadCheckInRecords() {
    let joinedEvents = JSON.parse(localStorage.getItem('joinedEvents')) || [];
    document.getElementById('checkInRecords').innerHTML = joinedEvents.map(event => `<div class="record-item">${event.name}  <span class="${event.status === '未打卡' ? 'red' : 'green'}">${event.status}</span></div>`).join('');
}

function loadEventManagement() {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    document.getElementById('eventManagementList').innerHTML = events.map(event => `<div class="record-item">${event.name}  成員: ${event.members.length}</div>`).join('');
}

async function loadUserName() {
    const userIDElement = document.getElementById('userID');
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
        userIDElement.innerHTML = '尚未登入，請前往<a href="https://harrylin0312.github.io/face-recognition/start/" style="color:blue;">登入</a>';
        userIDElement.className = 'red';
        return;
    }

    try {
        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userIDElement.textContent = `用戶：${userData.userName}`;
            userIDElement.className = 'green';
        } else {
            userIDElement.innerHTML = '尚未登入，請前往<a href="https://harrylin0312.github.io/face-recognition/start/" style="color:blue;">登入</a>';
            userIDElement.className = 'red';
        }
    } catch (error) {
        console.error('讀取使用者資料失敗:', error);
        userIDElement.innerHTML = '尚未登入，請前往<a href="https://harrylin0312.github.io/face-recognition/start/" style="color:blue;">登入</a>';
        userIDElement.className = 'red';
    }
}
