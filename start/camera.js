let socket = null;
let captureInterval = null;

export async function startCamera() {
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
        alert("請先登入才能打卡");
        return;
    }
    const video = document.getElementById('camera');
    if (!video) {
        console.error("找不到 <video id='camera'>");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        await video.play();
    } catch (err) {
        console.error("無法開啟攝影機：", err);
        alert("無法開啟攝影機，請確認權限設定");
        return;
    }
    socket = new WebSocket("wss://calculation-corrections-ronald-motor.trycloudflare.com");

    socket.onopen = () => {
        console.log("🔌 WebSocket 已連線 (startCamera)");
        startCaptureLoop(video);
    };
    socket.onmessage = evt => {
        console.log("👈 來自後端：", evt.data);
    };
    socket.onclose = () => {
        console.log("🔌 WebSocket 已斷開");
        stopCamera();
    };
    socket.onerror = err => {
        console.error("🔌 WebSocket 發生錯誤：", err);
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
        ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const dataURL = offscreenCanvas.toDataURL("image/jpeg", 0.7);
        const eventID = window.currentEventId || "test-event"; // fallback to test-event if undefined
        const payload = { type: "match_event_face", eventID, data: dataURL };
        console.log("➡️ 傳送影像給後端，size =", dataURL.length);
        socket.send(JSON.stringify(payload));
    }, 3000);
}

export function stopCamera() {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    const video = document.getElementById('camera');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
    socket = null;
}
