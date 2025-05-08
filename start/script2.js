// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
    const elements = mainMenu.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a');
    elements.forEach(element => element.classList.add('fade-in')); // 觸發初次淡入
    setTimeout(() => {
        elements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
        loadUserName();

        // 新增 userID 點擊展開/收合
        const userIDElement = document.getElementById('userID');
        if (userIDElement) {
            userIDElement.addEventListener('click', expandContract);
        }

        // 滑鼠懸浮監聽（userContainer hover 展開/收合），僅於非觸控裝置註冊
        const userContainer = document.getElementById('userContainer');
        const expandContent = $("#expand-contract");
        if (userContainer && !('ontouchstart' in window)) {
            userContainer.addEventListener('mouseenter', () => {
                expandContent.stop(true, true).slideDown(300);
                if (autoCollapseTimer) {
                    clearTimeout(autoCollapseTimer);
                    autoCollapseTimer = null;
                }
            });

            userContainer.addEventListener('mouseleave', () => {
                expandContent.stop(true, true).slideUp(300);
            });
        }

        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', createEvent);
        }

        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                const confirmLogout = confirm('確定要登出嗎?');
                if (confirmLogout) {
                    localStorage.removeItem('userUID');
                    window.location.href = 'https://harrylin0312.github.io/face-recognition/login/';
                }
            });
        }

        const sectionBtnMap = [
            ['bckToMainMenuFrmManage', 'mainMenu'],//回到主選單
            ['bckToMainMenuFrmJoin', 'mainMenu'],//回到主選單

            ['toManageEvent', 'manageEvent'],//舉辦紀錄
            ['toCreateEvent', 'createEvent'],//舉辦
            ['bckToManageEventFrmCreateEvent', 'manageEvent'],//回到舉辦紀錄
            ['toEventDetail', 'eventDetail'],//活動詳情
            ['bckToManageEventFrmEventDetail', 'manageEvent'],//回到舉辦紀錄

            ['toJoinRecord', 'joinRecord'],//參加紀錄
            ['toJoinEvent', 'joinEvent'],//參加
            ['bckToManageEventFrmJoinEvent', 'joinRecord'],//回到參加紀錄
        ];
        sectionBtnMap.forEach(([id, target]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => toggleSection(target));
            }
        });

        const joinEventBtn = document.getElementById('joinEventBtn');
        if (joinEventBtn) {
            joinEventBtn.addEventListener('click', joinEvent);
        }
    }, 300); // 動畫完成後清除
});

//動態視窗高度
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('load', setVH);
window.addEventListener('resize', setVH);

// 切換介面
function toggleSection(sectionId, eventId = null) {
    const allContainers = document.querySelectorAll('.container');
    const nextSection = document.getElementById(sectionId);
    const userID = document.getElementById('userContainer');
    // 儲存 userID 原本的 parent
    // const originalParent = userID.parentNode;
    let movedUserContainer = false;
    allContainers.forEach(container => {
        if (!container.classList.contains('hidden')) {
            const elements = container.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a, p:not(#userID)');
            elements.forEach(element => element.classList.add('fade-out')); // 觸發淡出
            setTimeout(() => {
                // 移動 userID 到 body（暫時移出要隱藏的 container）
                if (userContainer && userContainer.parentNode === container) {
                    document.body.appendChild(userContainer);
                    movedUserContainer = true;
                }
                container.classList.add('hidden');
                elements.forEach(element => element.classList.remove('fade-out')); // 清除淡出類別
            }, 300); // 等待淡出完成
        }
    });
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("Message").innerText = "";

    setTimeout(() => {
        nextSection.classList.remove('hidden');
        const nextElements = nextSection.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a');
        nextElements.forEach(element => element.classList.add('fade-in')); // 觸發淡入
        // 將 userID 插回到新可見 container 最上面
        if (movedUserContainer && userContainer) {
            nextSection.insertBefore(userID, nextSection.firstChild);
        }
        setTimeout(() => {
            nextElements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
        }, 500); // 清除動畫類別
        if (sectionId === 'joinRecord') {
            loadCheckInRecords();
        }
        if (sectionId === 'manageEvent') {
            loadEventManagement();
        }
        if (sectionId === 'eventDetail' && eventId) {
            loadEventDetail(eventId);
        }
    }, 300); // 與淡出時間同步
}
window.toggleSection = toggleSection;

//顯示用戶名稱
async function loadUserName() {
    const userIDElement = document.getElementById('userID');
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
        userIDElement.innerHTML = '<a href="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
        userIDElement.className = 'red';
        return;
    }

    userIDElement.textContent = '載入中...';
    userIDElement.className = '';

    try {
        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userIDElement.textContent = `用戶：${userData.userName}`;
            userIDElement.className = 'green';
        } else {
            userIDElement.innerHTML = '<a href="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
            userIDElement.className = 'red';
        }
    } catch (error) {
        console.error('讀取使用者資料失敗:', error);
        userIDElement.innerHTML = '<a href="https://harrylin0312.github.io/face-recognition/login/" style="color:blue;">登入</a>';
        userIDElement.className = 'red';
    }
}

// 用戶資訊欄
let autoCollapseTimer = null;

function expandContract() {
    const content = $("#expand-contract");
    content.stop(true, true).slideToggle(300);

    if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
    }

    if (content.is(":visible")) {
        autoCollapseTimer = setTimeout(() => {
            content.slideUp(300);
        }, 3000);
    }
}

//讀取舉辦紀錄
async function loadEventManagement() {
    const userUID = localStorage.getItem('userUID');
    const container = document.getElementById('eventManagementList');

    if (!userUID) {
        container.innerHTML = '尚未登入，請先 <a href="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
        return;
    }

    container.innerHTML = '讀取中...';

    try {
        const hostedEventsRef = collection(db, "users", userUID, "hostedEvents");
        const snapshot = await getDocs(hostedEventsRef);


        // 將 snapshot.docs 轉成陣列並依據活動的 createdAt 時間排序
        const sortedDocs = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const eventID = docSnap.id;
            const eventDoc = await getDoc(doc(db, "events", eventID));
            return { docSnap, eventDoc };
        }));

        sortedDocs.sort((a, b) => {
            const aTime = a.eventDoc.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            const bTime = b.eventDoc.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            return bTime - aTime; // 由新到舊
        });

        let html = `
            <div id="btnToCreateEvent" class="record-item no-hover" style="background-color: rgba(180, 180, 180, 0.25); border:rgba(202, 202, 202, 0.7) 1px solid;">
                <span class="btnCreateEvent">舉辦新活動+</span>
            </div>
        `;
        // 活動記錄列表繼續接在按鈕之後
        for (const { docSnap, eventDoc } of sortedDocs) {
            const eventID = docSnap.id;
            try {
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data();
                    const eventName = eventData.eventName || "無名稱";
                    const createdAt = eventData.createdAt?.toDate?.();
                    const formattedDate = createdAt
                        ? `${createdAt.getFullYear()}/${createdAt.getMonth() + 1}/${createdAt.getDate()}`
                        : "未知日期";
                    html += `<div class="record-item" onclick="toggleSection('eventDetail', '${eventID}')">
                                <span class="eventName">${eventName}</span>
                                <span class="eventDate">${formattedDate}</span>
                                <span class="arrow">&gt;</span>
                            </div>`;
                } else {
                    html += `<div class="record-item">找不到活動 (ID: ${eventID})</div>`;
                }
            } catch (innerErr) {
                console.error(`讀取活動 ${eventID} 錯誤：`, innerErr);
                html += `<div class="record-item">讀取失敗 (ID: ${eventID})</div>`;
            }
        }

        container.innerHTML = html;
        const newCreateBtn = document.getElementById('btnToCreateEvent');
        if (newCreateBtn) {
            newCreateBtn.addEventListener('click', () => toggleSection('createEvent'));
        }
        
    } catch (err) {
        console.error("讀取舉辦活動時發生錯誤：", err);
        container.innerHTML = '載入失敗，請稍後再試';
    }
}
//舉辦活動
function createEvent() {
    const eventName = document.getElementById('eventName').value.trim();
    if (!eventName) {
        alert('請輸入活動名稱');
        return;
    }

    const userUID = localStorage.getItem('userUID');
    if (!userUID) {
        alert('請先登入');
        return;
    }

    const eventsCollection = collection(db, "events");

    addDoc(eventsCollection, {
        eventName: eventName,
        organizerID: userUID,
        createdAt: serverTimestamp()
    })
    .then((docRef) => {
        alert('活動已成功建立');
        document.getElementById('eventName').value = '';
        loadEventManagement();

        // 新增儲存到 hostedEvents
        const hostedEventRef = doc(db, "users", userUID, "hostedEvents", docRef.id);
        setDoc(hostedEventRef, {
            eventName: eventName
        });
    })
    .catch((error) => {
        console.error('建立活動失敗：', error);
        alert('建立活動失敗，請稍後再試');
    });
}
window.createEvent = createEvent;
//讀取活動詳情
async function loadEventDetail(eventID) {
    const titleElement = document.querySelector('#eventDetail .title');
    const container = document.getElementById('EventDetailList');

    container.innerHTML = '讀取中...';

    try {
        // 讀取活動名稱
        const eventDocRef = doc(db, "events", eventID);
        const eventDocSnap = await getDoc(eventDocRef);

        if (eventDocSnap.exists()) {
            const eventData = eventDocSnap.data();
            titleElement.textContent = eventData.eventName || "無名稱";
        } else {
            titleElement.textContent = "找不到活動資料";
            container.innerHTML = '找不到活動';
            return;
        }

        // 讀取所有參加者
        const participantsRef = collection(db, "events", eventID, "participants");
        const participantsSnap = await getDocs(participantsRef);

        if (participantsSnap.empty) {
            container.innerHTML = '尚無參加者';
            return;
        }

        let html = '';
        for (const participantDoc of participantsSnap.docs) {
            const participantData = participantDoc.data();
            const userName = participantData.userName || "無名稱";
            const checkStatus = participantData.checkStatus || "未打卡";
            const checkTimeStamp = participantData.checkTime?.toDate?.();
            const checkTime = checkTimeStamp
                ? `${checkTimeStamp.getFullYear()}/${checkTimeStamp.getMonth() + 1}/${checkTimeStamp.getDate()}`
                : "未知日期";

            html += `<div class="record-item">
                        <span class="eventName">${userName}</span>
                        <span class="eventDate">${checkTime}</span>
                        <span class="${checkStatus === '未打卡' ? 'red' : 'green'}">${checkStatus}</span>
                    </div>`;
        }

        const totalParticipants = participantsSnap.size;
        let checkedInCount = 0;
        participantsSnap.forEach(doc => {
            const data = doc.data();
            if (data.checkStatus && data.checkStatus !== '未打卡') {
                checkedInCount++;
            }
        });

        const progressElement = document.getElementById('checkInProgress');
        progressElement.textContent = `打卡進度${checkedInCount}/${totalParticipants}`;
        container.innerHTML = html;

    } catch (error) {
        console.error("讀取活動詳情錯誤：", error);
        container.innerHTML = '載入失敗，請稍後再試';
    }
}

//讀取參加紀錄
async function loadCheckInRecords() {
    const userUID = localStorage.getItem('userUID');
    const container = document.getElementById('checkInRecords');

    if (!userUID) {
        container.innerHTML = '尚未登入，請先登入';
        return;
    }

    container.innerHTML = '讀取中...';

    try {
        const joinedEventsRef = collection(db, "users", userUID, "joinedEvents");
        const joinedSnapshot = await getDocs(joinedEventsRef);

        // 先將 joinedSnapshot.docs 轉成陣列並依據活動的 createdAt 時間排序
        const sortedJoinedDocs = await Promise.all(joinedSnapshot.docs.map(async (joinedDoc) => {
            const eventID = joinedDoc.id;
            const eventDocRef = doc(db, "events", eventID);
            const eventDocSnap = await getDoc(eventDocRef);
            return { joinedDoc, eventDocSnap };
        }));

        sortedJoinedDocs.sort((a, b) => {
            const aTime = a.eventDocSnap.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            const bTime = b.eventDocSnap.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            return bTime - aTime; // 由新到舊
        });

        
        let html = `
            <div class="record-item no-hover" id="recordJoinNew" style="background-color: rgba(180, 180, 180, 0.25); border:rgba(202, 202, 202, 0.7) 1px solid;">
                <span class="btnJoinEvent">加入新活動+</span>
            </div>
        `;
        for (const { joinedDoc, eventDocSnap } of sortedJoinedDocs) {
            const eventID = joinedDoc.id;
            try {
                const participantDocRef = doc(db, "events", eventID, "participants", userUID);
                const participantDocSnap = await getDoc(participantDocRef);

                if (eventDocSnap.exists() && participantDocSnap.exists()) {
                    const eventData = eventDocSnap.data();
                    const participantData = participantDocSnap.data();

                    const eventName = eventData.eventName || "無名稱";
                    const createdAt = eventData.createdAt?.toDate?.();
                    const formattedDate = createdAt
                        ? `${createdAt.getFullYear()}/${createdAt.getMonth() + 1}/${createdAt.getDate()}`
                        : "未知日期";
                    const checkStatus = participantData.checkStatus || "未打卡";

                    html += `<div class="record-item">
                                <span class="eventName">${eventName}</span>
                                <span class="eventDate">${formattedDate}</span>
                                <span class="${checkStatus === '未打卡' ? 'red' : 'green'}">${checkStatus}</span>
                            </div>`;
                } else {
                    html += `<div class="record-item">資料異常 (ID: ${eventID})</div>`;
                }
            } catch (innerErr) {
                console.error(`讀取活動 ${eventID} 或打卡資料錯誤：`, innerErr);
                html += `<div class="record-item">讀取失敗 (ID: ${eventID})</div>`;
            }
        }

        container.innerHTML = html;
        const newJoinBtn = document.getElementById('recordJoinNew');
        if (newJoinBtn) {
            newJoinBtn.addEventListener('click', () => toggleSection('joinEvent'));
        }
        
    } catch (err) {
        console.error("讀取參加活動時發生錯誤：", err);
        container.innerHTML = '載入失敗，請稍後再試';
    }
}
//加入活動
async function joinEvent() {
    const eventCode = document.getElementById('eventCode').value.trim();
    if (!eventCode) {
        alert('請輸入活動代碼');
        return;
    }

    const userUID = localStorage.getItem('userUID');
    if (!userUID) {
        alert('請先登入');
        return;
    }

    try {
        // 取得活動資料
        const eventDocRef = doc(db, "events", eventCode);
        const eventDocSnap = await getDoc(eventDocRef);

        if (!eventDocSnap.exists()) {
            alert('查無此活動，請確認代碼是否正確');
            return;
        }

        // 取得使用者名稱
        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            alert('查無使用者資料，請重新登入');
            return;
        }

        const userName = userDocSnap.data().userName || "匿名";

        // 寫入 participants 資料
        const participantRef = doc(db, "events", eventCode, "participants", userUID);
        await setDoc(participantRef, {
            userName: userName,
            checkStatus: "未打卡",
            checkTime: serverTimestamp()
        });

        // 寫入 joinedEvents 資料
        const eventName = eventDocSnap.data().eventName || "未命名活動";
        const joinedEventRef = doc(db, "users", userUID, "joinedEvents", eventCode);
        await setDoc(joinedEventRef, {
            eventName: eventName
        });

        alert('成功加入活動');
        document.getElementById('eventCode').value = '';
    } catch (error) {
        console.error('加入活動失敗:', error);
        alert('加入活動失敗，請稍後再試');
    }
}
window.joinEvent = joinEvent;
