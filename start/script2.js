import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
