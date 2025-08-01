// 導入 Firebase 模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const BUCKET_NAME = "face123";
export const supabase = createClient("https://wiqldwmpszfinwbdegrs.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcWxkd21wc3pmaW53YmRlZ3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTUyNTQsImV4cCI6MjA2NDUzMTI1NH0.gbPCAFdTdEcl8-1C4OnNlp2G0YGue6kd1N9cvxmqiUA");

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
import { loadCheckInRecords, joinEvent, addExitEventListener } from './join.js';
import { loadPersonalData } from './personalData.js';
import { toggleSection } from './toggleSection.js';
import { startCamera, stopCamera } from './camera.js';

window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.createEvent = createEvent;
window.loadEventManagement = loadEventManagement;
window.loadEventDetail = loadEventDetail;
window.loadCheckInRecords = loadCheckInRecords;
window.joinEvent = joinEvent;
window.loadPersonalData = loadPersonalData;
window.toggleSection = toggleSection;
window.addExitEventListener = addExitEventListener;



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
                    navigateWithAnimation('../login/');
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
            ['toCheckIn','checkIn'],//打卡
            ['bckToEventDetailFrmCheckIn', 'eventDetail'],//回到活動詳情

            ['toJoinRecord', 'joinRecord'],//參加紀錄
            ['toJoinEvent', 'joinEvent'],//參加
            ['bckToManageEventFrmJoinEvent', 'joinRecord'],//回到參加紀錄
            ['toJoinEventDetail', 'joinEventDetail'], //參加活動詳情
            ['bckToJoinEventFrmJoinEventDetail', 'joinRecord'], //回到參加紀錄
            ['toEventDDetail', 'eventDDetail'],//活動詳情
            ['bckToEventDetailFrmEventDDetail', 'eventDetail'],//回到舉辦紀錄
            
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

//顯示用戶名稱
export async function loadUserName() {
    const userIDElement = document.getElementById('userID');
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
        userIDElement.innerHTML = '<a href="#" class="animated-link" data-url="../login/" style="color:red;">登入</a>';
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
            localStorage.setItem("userData", JSON.stringify(userData));
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
            userIDElement.innerHTML = '<a href="#" class="animated-link" data-url="../login/" style="color:red;">登入</a>';
            userIDElement.className = 'red';
        }
    } catch (error) {
        console.error('讀取使用者資料失敗:', error);
        if (error.code === 'unavailable' || !navigator.onLine) {
            userIDElement.textContent = '網路連線錯誤';
        } else {
            userIDElement.innerHTML = '<a href="#" class="animated-link" data-url="../login/" style="color:red;">登入</a>';
        }
        userIDElement.className = 'red';
    }
    checkUploadedImages()
}
export async function checkUploadedImages() {
    // 檢查是否有上傳個人臉部影像
    const uploadSign = document.getElementById("uploadSign");
    const uploadBtn = document.querySelector(".PDuploadBtn");
    const userUID = localStorage.getItem("userUID");

    if (!uploadSign || !uploadBtn || !userUID) return;

    uploadSign.textContent = "載入中...";
    uploadSign.style.color = "black";
    uploadBtn.style.display = "none";

    const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list("", { search: `${userUID}.jpg` });

    if (error || !data || data.length === 0) {
        uploadSign.innerHTML = `上傳用戶臉部影像`;
        uploadSign.style.color = "red";
        uploadBtn.style.display = "inline-block";
        // 取得 userData 並更新 #userID，顯示警示圖示
        const userIDElement = document.getElementById("userID");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userIDElement.innerHTML = `用戶：${userData.userName} <span style="color:red;"><i class="fa-solid fa-triangle-exclamation"></i></span>`;
        userIDElement.className = 'green';

        // 在 .detail 後加入警示圖示
        const detailElement = document.querySelector(".detail");
        if (detailElement && !detailElement.querySelector(".warning-icon")) {
            const warningIcon = document.createElement("i");
            warningIcon.className = "fa-solid fa-triangle-exclamation warning-icon";
            warningIcon.style.color = "red";
            warningIcon.style.marginLeft = "6px";
            detailElement.appendChild(warningIcon);
        }
    } else {
        uploadSign.textContent = "已完成上傳";
        uploadSign.style.color = "green";
        uploadBtn.style.display = "none";
        // 取得 userData 並更新 #userID，移除警示圖示
        const userIDElement = document.getElementById("userID");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (userIDElement && userData.userName) {
            userIDElement.textContent = `用戶：${userData.userName}`;
            userIDElement.className = 'green';
        }
        // 查詢成功且圖片存在時，清除 .detail 旁的警示圖示
        const detailElement = document.querySelector(".detail");
        if (detailElement) {
            const warningIcon = detailElement.querySelector(".warning-icon");
            if (warningIcon) detailElement.removeChild(warningIcon);
        }
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
