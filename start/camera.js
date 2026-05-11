import { toggleSection } from './toggleSection.js';
import { db } from './script2.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
let socket = null;
let firstSendDone = false;
let currentStream = null;
let cameraActive = false;
let captureInterval = null;

export async function startCamera() {
    const userUID = localStorage.getItem("userUID");
    
    //設定標題
    const eventName = document.querySelector('#eventDetail .title')?.textContent || '無名稱';
    const checkInTitle = document.querySelector('#checkIn .title');
    if (checkInTitle) {
        checkInTitle.textContent = eventName;
    }

    const video = document.getElementById('camera');
    if (!video) {
        console.error("找不到 <video id='camera'>");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        currentStream = stream;
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play().then(resolve);
            };
        });
        cameraActive = true;
    } catch (err) {
        console.error("無法開啟攝影機：", err);
        alert("無法開啟攝影機，請確認權限設定");
        stopCamera();
        toggleSection("eventDetail", window.currentEventId);
        return;
    }
    socket = new WebSocket("wss://discharge-setting-sense-boxes.trycloudflare.com");

    socket.onopen = () => {
        console.log("🔌 WebSocket 已連線 (startCamera)");
        startCaptureLoop(video);
    };
    socket.onmessage = async evt => {
        console.log("👈 來自後端：", evt.data);
        const checkerMessage = document.getElementById("checkerMessage");
        try {
            const data = JSON.parse(evt.data);
            if (data.status === "ok" && data.user) {
                const userRef = doc(db, "users", data.user);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userName = userSnap.data().userName || "未知使用者";
                    checkerMessage.textContent = `${userName}打卡成功！`;
                    checkerMessage.className = "green";
                } else {
                    checkerMessage.textContent = "使用者不存在！";
                    checkerMessage.className = "red";
                }
            } else if (data.status === "fail") {
                if (data.reason === "無人臉") {
                    checkerMessage.textContent = "等待中...";
                    checkerMessage.className = "black";
                } else if (data.reason.includes("伺服器忙碌中")) {
                    checkerMessage.textContent = "⚠️ 伺服器忙碌中，請稍候...";
                    checkerMessage.className = "orange";
                } else {
                    checkerMessage.textContent = `辨識失敗：${data.reason || "未知原因"}`;
                    checkerMessage.className = "red";
                }
            } else if (data.status === "error") {
                checkerMessage.textContent = `伺服器錯誤：${data.message}`;
                checkerMessage.className = "red";
            }
        } catch (e) {
            console.error("解析後端訊息時發生錯誤：", e);
        }
    };
    socket.onclose = () => {
        console.log("🔌 WebSocket 已斷開");
        stopCamera();
        toggleSection("eventDetail", window.currentEventId);
    };
    socket.onerror = err => {
        console.error("🔌 WebSocket 發生錯誤：", err);
        alert("無法連線至後端，請稍後再試");
        stopCamera();
        toggleSection("eventDetail", window.currentEventId);
    };
}

function startCaptureLoop(video) {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    const offscreenCanvas = document.createElement("canvas");
    const ctx = offscreenCanvas.getContext("2d");
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;

    captureInterval = setInterval(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.warn("⚠️ WebSocket 尚未 open，跳過本次傳送");
            return;
        }
        if (!firstSendDone) {
            const checkerMessage = document.getElementById("checkerMessage");
            checkerMessage.textContent = "等待中...";
            checkerMessage.className = "black";
            firstSendDone = true;
        }
        ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const dataURL = offscreenCanvas.toDataURL("image/jpeg", 0.7);
        const eventID = window.currentEventId || "test-event"; // fallback to test-event if undefined
        const payload = { type: "match_event_face", eventID, data: dataURL };
        console.log("➡️ 傳送影像給後端，size =", dataURL.length);
        socket.send(JSON.stringify(payload));
    }, 3000);
}

export function stopCamera() {
    if (!cameraActive) return;
    cameraActive = false;
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    const video = document.getElementById('camera');
    if (currentStream) {
        const tracks = currentStream.getTracks();
        tracks.forEach(track => {
            if (track.readyState === 'live') {
                track.stop();
            }
        });
        currentStream = null;
    }
    if (video) {
        video.pause();
        video.removeAttribute('srcObject');
        video.srcObject = null;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
    socket = null;
    // 新增重設 checkerMessage 與 firstSendDone
    const checkerMessage = document.getElementById("checkerMessage");
    if (checkerMessage) {
        checkerMessage.textContent = "啟動中...";
        checkerMessage.className = "black";
    }
    firstSendDone = false;
    console.log("🛑 已停止攝影機與 WebSocket");
}
