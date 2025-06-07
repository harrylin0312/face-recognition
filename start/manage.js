import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";import { db } from './script2.js';

export async function loadEventManagement() {
    //取得目前登入使用者的 UID
    const userUID = localStorage.getItem('userUID');
    const container = document.getElementById('eventManagementList');

    if (!userUID) {
        container.innerHTML = '尚未登入，請先 <a href="#" class="animated-link" data-url="https://harrylin0312.github.io/face-recognition/login/" style="color:red;">登入</a>';
        return;
    }

    container.innerHTML = '讀取中...';

    try {
        //取得使用者舉辦的所有活動文件集合
        const hostedEventsRef = collection(db, "users", userUID, "hostedEvents");
        //取得活動詳細資料並依建立時間排序
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

//產生隨機活動
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

//產生唯一的活動ID
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
    const eventNameInput = document.getElementById('eventName');
    const eventName = eventNameInput.value.trim();
    const submitBtn = document.getElementById('createEventBtn');

    if (!eventName) {
        alert('請輸入活動名稱');
        return;
    }

    // 鎖定按鈕
    submitBtn.disabled = true;
    submitBtn.textContent = "建立中...";

    //確認使用者是否已登入
    const userUID = localStorage.getItem('userUID');
    if (!userUID) {
        alert('請先登入');
        submitBtn.disabled = false;
        submitBtn.textContent = "確認";
        return;
    }

    try {
        const eventID = await getUniqueEventID(); //使用隨機ID

        //寫入活動資料至events集合與使用者hostedEvents子集合
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
    } finally {
        // 解鎖按鈕
        submitBtn.disabled = false;
        submitBtn.textContent = "確認";
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
            //顯示活動名稱
            const eventData = eventDocSnap.data();
            titleElement.textContent = eventData.eventName || "無名稱";
        } else {
            titleElement.textContent = "找不到活動資料";
            container.innerHTML = '找不到活動';
            return;
        }

        //取得活動參加者清單
        const participantsRef = collection(db, "events", eventID, "participants");
        const participantsSnap = await getDocs(participantsRef);

        if (participantsSnap.empty) {
            container.innerHTML = '尚無參加者';
            return;
        }

        let html = '';
        for (const participantDoc of participantsSnap.docs) {
            const userID = participantDoc.id;
            const participantData = participantDoc.data();

            let userName = "無名稱";
            try {
                const userDoc = await getDoc(doc(db, "users", userID));
                if (userDoc.exists()) {
                    userName = userDoc.data().userName || "無名稱";
                }
            } catch (e) {
                console.warn(`無法取得使用者 ${userID} 資料`, e);
            }

            const checkStatus = participantData.checkStatus || "未打卡";
            const checkTimeStamp = participantData.checkTime?.toDate?.();
            const checkTime = (checkStatus !== '未打卡' && checkTimeStamp)
                ? `${checkTimeStamp.getFullYear()}/${checkTimeStamp.getMonth() + 1}/${checkTimeStamp.getDate()}`
                : "";

            html += `<div class="record-item">
                        <span class="eventName">${userName}</span>
                        <span class="eventDate">${checkTime}</span>
                        <span class="${checkStatus === '未打卡' ? 'red' : 'green'}">${checkStatus}</span>
                    </div>`;
        }

        // 新增刪除活動按鈕
        html += `<div class="record-item delete-button" id="deleteEventButton">
                    <span class="btnDeleteEvent">刪除活動</span>
                </div>`;

        //計算已打卡的參加者人數並更新進度文字
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

        // 綁定刪除活動按鈕事件
        const deleteBtn = document.getElementById('deleteEventButton');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const confirmed = confirm('確定要刪除活動嗎？');
                if (confirmed) {
                    try {
                        const userUID = localStorage.getItem('userUID');
                        if (!userUID) throw new Error("使用者未登入");

                        await deleteDoc(doc(db, "events", eventID));
                        await deleteDoc(doc(db, "users", userUID, "hostedEvents", eventID));

                        toggleSection('manageEvent');
                        alert('活動已成功刪除');
                    } catch (e) {
                        console.error("刪除活動失敗：", e);
                        alert('刪除活動失敗，請稍後再試');
                    }
                }
            });
        }

    } catch (error) {
        console.error("讀取活動詳情錯誤：", error);
        container.innerHTML = '載入失敗，請稍後再試';
    }
}
