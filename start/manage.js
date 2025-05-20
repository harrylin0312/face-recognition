import { navigateWithAnimation } from './script2.js';
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from './script2.js';

export async function loadEventManagement() {
    const userUID = localStorage.getItem('userUID');
    const container = document.getElementById('eventManagementList');

    if (!userUID) {
        container.innerHTML = '尚未登入，請先 <a href="#" class="animated-link" data-url="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
        return;
    }

    container.innerHTML = '讀取中...';

    try {
        const hostedEventsRef = collection(db, "users", userUID, "hostedEvents");
        const snapshot = await getDocs(hostedEventsRef);

        const sortedDocs = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const eventID = docSnap.id;
            const eventDoc = await getDoc(doc(db, "events", eventID));
            return { docSnap, eventDoc };
        }));

        sortedDocs.sort((a, b) => {
            const aTime = a.eventDoc.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            const bTime = b.eventDoc.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            return bTime - aTime;
        });

        let html = `
            <div id="btnToCreateEvent" class="record-item no-hover" style="background-color: rgba(180, 180, 180, 0.25); border:rgba(202, 202, 202, 0.7) 1px solid;">
                <span class="btnCreateEvent">舉辦新活動+</span>
            </div>
        `;
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
                    html += `<div class="record-item" onclick="toggleSection('eventDetail', '${eventID}', '${eventName}')">
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

// ✅ 產生隨機 eventID（格式：3字母 + 3數字）
function generateCustomEventID() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let id = '';
    for (let i = 0; i < 3; i++) {
        id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
        id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return id;
}

// ✅ 確保唯一的 eventID
async function getUniqueEventID() {
    let eventID;
    let exists = true;

    while (exists) {
        eventID = generateCustomEventID();
        const docRef = doc(db, "events", eventID);
        const docSnap = await getDoc(docRef);
        exists = docSnap.exists();
    }

    return eventID;
}

export async function createEvent() {
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

    try {
        const eventID = await getUniqueEventID(); // 使用自訂 ID

        await setDoc(doc(db, "events", eventID), {
            eventName: eventName,
            organizerID: userUID,
            createdAt: serverTimestamp()
        });

        await setDoc(doc(db, "users", userUID, "hostedEvents", eventID), {
            eventName: eventName
        });

        alert('活動已成功建立');
        document.getElementById('eventName').value = '';
        loadEventManagement();

    } catch (error) {
        console.error('建立活動失敗：', error);
        alert('建立活動失敗，請稍後再試');
    }
}

export async function loadEventDetail(eventID) {
    window.currentEventId = eventID;
    const titleElement = document.querySelector('#eventDetail .title');
    const container = document.getElementById('EventDetailList');

    container.innerHTML = '讀取中...';

    try {
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
        progressElement.textContent = `進度${checkedInCount}/${totalParticipants}`;
        container.innerHTML = html;

    } catch (error) {
        console.error("讀取活動詳情錯誤：", error);
        container.innerHTML = '載入失敗，請稍後再試';
    }
}
