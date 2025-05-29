// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 初始化 Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDDRL_2uAJD63ALwp2uNtAnakA4BayVl30",
    authDomain: "face-recognition-556ed.firebaseapp.com",
    projectId: "face-recognition-556ed",
    storageBucket: "face-recognition-556ed.firebasestorage.app",
    messagingSenderId: "614926935705",
    appId: "1:614926935705:web:57d56d7115a6504497fa08",
    measurementId: "G-YXSM0L5Z83"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 引入外部模組
import { loadEventManagement, createEvent, loadEventDetail } from './manage.js';
import { loadCheckInRecords, joinEvent } from './join.js';
import { loadPersonalData } from './personalData.js';
window.createEvent = createEvent;
window.loadEventManagement = loadEventManagement;
window.loadEventDetail = loadEventDetail;
window.loadCheckInRecords = loadCheckInRecords;
window.joinEvent = joinEvent;
window.loadPersonalData = loadPersonalData;

// 攝影機功能
async function startCamera() {
    const video = document.getElementById('camera');
    if (!video) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    } catch (err) {
        console.error("無法開啟攝影機：", err);
        alert("無法開啟攝影機，請確認瀏覽器權限設定");
    }
}

// 頁面載入時觸發淡入效果
document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('mainMenu');
    const elements = mainMenu.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a');
    elements.forEach(element => element.classList.add('fade-in')); // 觸發初次淡入
    setTimeout(() => {
        elements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
        loadUserName();

        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', createEvent);
        }

        //登出
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                const confirmLogout = confirm('確定要登出嗎?');
                if (confirmLogout) {
                    localStorage.removeItem('userUID');
                    navigateWithAnimation('https://harrylin0312.github.io/face-recognition/login/');
                }
            });
        }
        
        let currentHeight, currentWidth, finalHeight, finalWidth;

        const close_btn = document.getElementById('closeBtn');
        const detailBtn = document.querySelector('.detail');

        if (detailBtn && close_btn) {
            //打開用戶資料
            detailBtn.addEventListener('click', () => {
                const userContainer = document.getElementById('userContainer');
                const expandContent = $("#expand-contract");

                //收起展開內容後再展開
                expandContent.stop(true, true).slideUp(20, () => {
                    currentHeight = window.getComputedStyle(userContainer).height;//獲取收起後的高度
                    currentWidth = window.getComputedStyle(userContainer).width;

                    userContainer.style.height = currentHeight;
                    userContainer.style.width = currentWidth;
                    userContainer.classList.add('expand');

                    const elementsToHide = document.querySelectorAll("#userID, #expand-container");
                    elementsToHide.forEach(element => element.classList.remove("fade-in"));
                    elementsToHide.forEach(element => element.classList.add("fade-out"));
                    setTimeout(() => {
                        document.getElementById('PDpersonalPage').classList.remove('hidden');
                        document.getElementById('PDpersonalPage').classList.add('fade-in');
                        loadPersonalData();

                        close_btn.style.display = 'block';
                        close_btn.classList.add('fade-in');
                    }, 700);
                });
            });

            close_btn.addEventListener('click', () => {
                const userContainer = document.getElementById('userContainer');
                finalHeight = window.getComputedStyle(userContainer).height;//獲取當前高度
                finalWidth = window.getComputedStyle(userContainer).width;
                userContainer.style.height = finalHeight;
                userContainer.style.width = finalWidth;
                userContainer.style.setProperty('--target-height', currentHeight);
                userContainer.style.setProperty('--target-width', currentWidth);
                userContainer.classList.remove('expand');
                userContainer.classList.add('expand2');

                const elementsToHide = document.querySelectorAll("#userID, #expand-container");
                elementsToHide.forEach(element => element.style.opacity = 0);
                elementsToHide.forEach(element => element.classList.remove("fade-out"));
                setTimeout(() => {
                    elementsToHide.forEach(element => element.classList.add("fade-in"));
                }, 400);

                const personalPage = document.getElementById('PDpersonalPage');
                personalPage.classList.remove('fade-in');
                personalPage.classList.add('fade-out');
                setTimeout(() => {
                    personalPage.classList.add('hidden');
                    personalPage.classList.remove('fade-out');
                }, 300);

                close_btn.classList.remove('fade-in');
                close_btn.style.display = 'none';

                setTimeout(() => {
                    userContainer.classList.remove('expand2');
                    userContainer.style.height = '';
                    userContainer.style.width = '';
                }, 700);
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
            ['start','checkIn'],//打卡
            ['bckToEventDetailFrmCheckIn', 'eventDetail'],//回到活動詳情

            ['toJoinRecord', 'joinRecord'],//參加紀錄
            ['toJoinEvent', 'joinEvent'],//參加
            ['bckToManageEventFrmJoinEvent', 'joinRecord'],//回到參加紀錄
            ['bckToJoinEventFrmJoinEventDetail', 'joinRecord'], // 從詳細頁返回參加紀錄
            
        ];
        sectionBtnMap.forEach(([id, target]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => toggleSection(target));
            }
        });

        // 新增「打卡」按鈕點擊事件，帶入活動名稱
        const startCheckInBtn = document.getElementById('start');
        if (startCheckInBtn) {
            startCheckInBtn.addEventListener('click', () => {
                const eventName = document.querySelector('#eventDetail .title')?.textContent || '';
                const eventId = window.currentEventId;
                toggleSection('checkIn', eventId, eventName);
            });
        }

        const joinEventBtn = document.getElementById('joinEventBtn');
        if (joinEventBtn) {
            joinEventBtn.addEventListener('click', joinEvent);
        }
    }, 300); // 動畫完成後清除

    // 新增全域點擊監聽，處理帶有 .animated-link 且有 data-url 的連結
    document.addEventListener('click', function (e) {
        const target = e.target.closest('.animated-link');
        if (target && target.dataset.url) {
            e.preventDefault();
            navigateWithAnimation(target.dataset.url);
        }
    });
});

//動態視窗高度
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('load', setVH);
window.addEventListener('resize', setVH);

// 切換介面
function toggleSection(sectionId, eventId = null, eventName = '') {
    const allContainers = document.querySelectorAll('.container');
    const nextSection = document.getElementById(sectionId);
    const userID = document.getElementById('userContainer');
    const close_btn = document.getElementById('closeBtn');
    let movedUserContainer = false;
    let movedCloseBtn = false;
    allContainers.forEach(container => {
        if (!container.classList.contains('hidden')) {
            const elements = container.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a, p:not(#userID)');
            elements.forEach(element => element.classList.add('fade-out')); // 觸發淡出
            setTimeout(() => {
                const userContainer = document.getElementById('userContainer');
                // 移動 userID 到 body（暫時移出要隱藏的 container）
                if (userContainer && userContainer.parentNode === container) {
                    document.body.appendChild(userContainer);
                    movedUserContainer = true;
                }
                // 移動 closeBtn 到 body（暫時移出要隱藏的 container）
                if (close_btn && close_btn.parentNode === container) {
                    document.body.appendChild(close_btn);
                    movedCloseBtn = true;
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
        // 將 closeBtn 插回到新可見 container 最上面
        if (movedCloseBtn && close_btn) {
            nextSection.insertBefore(close_btn, nextSection.firstChild);
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
        if (sectionId === 'joinEventDetail' && eventId) {
            const detailTitle = document.querySelector('#joinEventDetail .title');
            if (detailTitle) {
                detailTitle.textContent = eventName;
            }
        }
        if (sectionId === 'checkIn') {
            const checkInTitle = document.querySelector('#checkIn .title');
            if (checkInTitle) {
                checkInTitle.textContent = eventName;
            }
            startCamera();
        }
    }, 300); // 與淡出時間同步
}
window.toggleSection = toggleSection;

//顯示用戶名稱
export async function loadUserName() {
    const userIDElement = document.getElementById('userID');
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
        userIDElement.innerHTML = '<a href="#" class="animated-link" data-url="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
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
            userIDElement.addEventListener('click', expandContract);

            //滑鼠懸浮展開選單事件
            const userContainer = document.getElementById('userContainer');
            const expandContent = $("#expand-contract");
            if (userContainer && !('ontouchstart' in window)) {
                userContainer.addEventListener('mouseenter', () => {
                    expandContent.stop(true, true).slideDown(200);
                    if (autoCollapseTimer) {
                        clearTimeout(autoCollapseTimer);
                        autoCollapseTimer = null;
                    }
                });

                userContainer.addEventListener('mouseleave', () => {
                    expandContent.stop(true, true).slideUp(100);
                });
            }
        } else {
            userIDElement.innerHTML = '<a href="#" class="animated-link" data-url="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
            userIDElement.className = 'red';
        }
    } catch (error) {
        console.error('讀取使用者資料失敗:', error);
        if (error.code === 'unavailable' || !navigator.onLine) {
            userIDElement.textContent = '網路連線錯誤';
        } else {
            userIDElement.innerHTML = '<a href="#" class="animated-link" data-url="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
        }
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

// 回退強制重整強制重整
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      window.location.reload();
    }
});
// 導頁動畫函式
export function navigateWithAnimation(url) {
    const container = document.querySelector('.container:not(.hidden)');
    if (!container) {
        window.location.href = url;
        return;
    }

    const innerElements = container.querySelectorAll(':scope *');    
    container.classList.add('expand-logOut');
    innerElements.forEach(el => el.classList.add('fade-out'));

    setTimeout(() => {
        window.location.href = url;
    }, 1600); // 1.6秒
}
