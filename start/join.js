import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from './script2.js';

export async function loadCheckInRecords() {
    const userUID = localStorage.getItem('userUID');
    const container = document.getElementById('checkInRecords');

    if (!userUID) {
        container.innerHTML = '尚未登入，請先 <a href="#" class="animated-link" data-url="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
        return;
    }

    container.innerHTML = '讀取中...';

    try {
        const joinedEventsRef = collection(db, "users", userUID, "joinedEvents");
        const joinedSnapshot = await getDocs(joinedEventsRef);

        const sortedJoinedDocs = await Promise.all(joinedSnapshot.docs.map(async (joinedDoc) => {
            const eventID = joinedDoc.id;
            const eventDocRef = doc(db, "events", eventID);
            const eventDocSnap = await getDoc(eventDocRef);
            return { joinedDoc, eventDocSnap };
        }));

        sortedJoinedDocs.sort((a, b) => {
            const aTime = a.eventDocSnap.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            const bTime = b.eventDocSnap.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            return bTime - aTime;
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

                    html += `<div class="record-item" onclick="toggleSection('joinEventDetail', '${eventID}', '${eventName}')">
                                <span class="eventName">${eventName}</span>
                                <span class="eventDate eventDateToggle">${formattedDate}</span>
                                <span class="${checkStatus === '未打卡' ? 'red' : 'green'}">${checkStatus}</span>
                                <span class="arrow">&gt;</span>
                            </div>`;
                } else {
                    html += `<div class="record-item" onclick="toggleSection('joinEventDetail', '${eventID}', '活動已被刪除')">活動已被刪除 (ID: ${eventID})<span class="arrow">&gt;</span></div>`;
                }
            } catch (innerErr) {
                console.error(`讀取活動 ${eventID} 或打卡資料錯誤：`, innerErr);
                html += `<div class="record-item">讀取失敗 (ID: ${eventID})</div>`;
            }
        }

        container.innerHTML = html;
        adjustEventDateVisibility();
        window.addEventListener('resize', adjustEventDateVisibility);
        const newJoinBtn = document.getElementById('recordJoinNew');
        if (newJoinBtn) {
            newJoinBtn.addEventListener('click', () => toggleSection('joinEvent'));
        }
    } catch (err) {
        console.error("讀取參加活動時發生錯誤：", err);
        if (!navigator.onLine || err.code === 'unavailable') {
            container.innerHTML = '<span style="color:red;">網路連線錯誤</span>';
        } else {
            container.innerHTML = '載入失敗，請稍後再試';
        }
    }
}

export async function joinEvent() {
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
        const eventDocRef = doc(db, "events", eventCode);
        const eventDocSnap = await getDoc(eventDocRef);

        if (!eventDocSnap.exists()) {
            alert('查無此活動，請確認代碼是否正確');
            return;
        }

        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            alert('查無使用者資料，請重新登入');
            return;
        }

        const userName = userDocSnap.data().userName || "匿名";

        const participantRef = doc(db, "events", eventCode, "participants", userUID);
        await setDoc(participantRef, {
            userName: userName,
            checkStatus: "未打卡",
            checkTime: serverTimestamp()
        });

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

function adjustEventDateVisibility() {
    const isMobile = window.innerWidth <= 768;
    document.querySelectorAll('.eventDateToggle').forEach(el => {
        el.style.display = isMobile ? 'none' : '';
    });
}

// 載入參加活動詳情
export async function loadJoinEventDetail(eventID) {
    const userUID = localStorage.getItem('userUID');
    if (!userUID) {
        alert('請先登入');
        return;
    }

    const eventDetailDiv = document.getElementById('joinEventDetail');
    const fields = eventDetailDiv.querySelectorAll('.field');

    try {
        const eventDocRef = doc(db, "events", eventID);
        const eventSnap = await getDoc(eventDocRef);
        if (!eventSnap.exists()) {
            // 找不到活動資料時，顯示「未知」字串，但活動ID保持不變
            eventDetailDiv.querySelector('h2.title').textContent = '未知';
            if (fields.length >= 6) {
                fields[0].innerHTML = '';
                fields[1].innerHTML = '';
                fields[2].innerHTML = `<label>活動ID</label><div class="rightItem">${eventID}</div>`;
                fields[3].innerHTML = `
                    <label>舉辦者</label>
                    <div class="rightItem">未知</div>
                `;
                fields[4].innerHTML = `
                    <label>舉辦時間</label>
                    <div class="rightItem">未知</div>
                `;
                fields[5].innerHTML = `
                    <label>打卡狀態</label>
                    <div class="joinCheckStatus rightItem" style="color:black">未知</div>
                `;
            }
            const exitButton = eventDetailDiv.querySelector('.exitEvent');
            if (exitButton) exitButton.textContent = '退出活動';
            eventDetailDiv.setAttribute('data-event-id', eventID);
            addExitEventListener();
            return;
        }

        const eventData = eventSnap.data();
        const eventName = eventData.eventName || "無名稱";
        let organizer = "未知";
        const organizerID = eventData.organizerID;
        if (organizerID) {
            try {
                const organizerDoc = await getDoc(doc(db, "users", organizerID));
                if (organizerDoc.exists()) {
                    organizer = organizerDoc.data().userName || "未知";
                }
            } catch (e) {
                console.error("查詢舉辦者資料時發生錯誤：", e);
            }
        }
        const createdAt = eventData.createdAt?.toDate?.();
        const createdAtStr = createdAt
            ? `${createdAt.getFullYear()}/${createdAt.getMonth() + 1}/${createdAt.getDate()}`
            : "未知時間";

        const participantRef = doc(db, "events", eventID, "participants", userUID);
        const participantSnap = await getDoc(participantRef);
        const checkStatus = participantSnap.exists() ? participantSnap.data().checkStatus : "未打卡";
        const checkColorClass = checkStatus === "未打卡" ? "red" : "green";

        // 更新 DOM
        eventDetailDiv.querySelector('h2.title').textContent = eventName;

        if (fields.length >= 6) {
            fields[0].innerHTML = '';
            fields[1].innerHTML = '';
            fields[2].innerHTML = `<label>活動ID</label><div class="rightItem">${eventID}</div>`;
            fields[3].innerHTML = `
                <label>舉辦者</label>
                <div class="rightItem">${organizer}</div>
            `;
            fields[4].innerHTML = `
                <label>舉辦時間</label>
                <div class="rightItem">${createdAtStr}</div>
            `;
            fields[5].innerHTML = `
                <label>打卡狀態</label>
                <div class="joinCheckStatus rightItem ${checkColorClass}">${checkStatus}</div>
            `;
        }
        const exitButton = eventDetailDiv.querySelector('.exitEvent');
        if (exitButton) exitButton.textContent = '退出活動';
        eventDetailDiv.setAttribute('data-event-id', eventID);
        addExitEventListener();
    } catch (err) {
        console.error("載入活動詳情失敗：", err);
        alert("載入活動詳情失敗，請稍後再試");
    }
}

export function addExitEventListener() {
    // 先把所有 .exitEvent 元素換成新節點（清除舊事件）
    document.querySelectorAll('.exitEvent').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });

    // 再重新綁定事件
    document.querySelectorAll('.exitEvent').forEach(button => {
        button.addEventListener('click', async () => {
            if (!confirm("確定要退出活動嗎？")) return;

            const eventDetailDiv = document.getElementById('joinEventDetail');
            const eventID = eventDetailDiv.getAttribute('data-event-id');
            const userUID = localStorage.getItem('userUID');

            if (!eventID || !userUID) {
                alert("無法取得活動 ID 或使用者資訊");
                return;
            }

            try {
                const participantRef = doc(db, "events", eventID, "participants", userUID);
                const joinedEventRef = doc(db, "users", userUID, "joinedEvents", eventID);

                await Promise.all([
                    deleteDoc(participantRef),
                    deleteDoc(joinedEventRef)
                ]);

                alert("已退出活動");
                toggleSection('joinRecord');
                loadCheckInRecords();
            } catch (err) {
                console.error("退出活動失敗：", err);
                alert("退出活動失敗，請稍後再試");
            }
        });
    });
}
