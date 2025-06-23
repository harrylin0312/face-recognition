import { db, loadUserName, supabase ,checkUploadedImages } from "./script2.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const BUCKET_NAME = "face123";




export async function loadPersonalData() {
  const userUID = localStorage.getItem("userUID");
  if (!userUID) {
    document.getElementById("PDusername-container").textContent = "未登入";
    document.getElementById("PDemail").textContent = "";
    document.getElementById("PDregistrationDate").textContent = "(未知)";
    return;
  }
  const userDocRef = doc(db, "users", userUID);
  const userSnap = await getDoc(userDocRef);

  //預設資料
  const user = {
    username: userSnap.exists() ? (userSnap.data().userName || "") : "",
    email: userSnap.exists() ? (userSnap.data().email || "") : "",
    registrationDate: userSnap.exists() ? (() => {
      const createdAtVal = userSnap.data().createdAt;
      if (createdAtVal && createdAtVal.toDate) {
        const dateObj = createdAtVal.toDate();
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      }
      return "(未知)";
    })() : "(未知)"
  };

  let editingUsername = false;
  let newUsername = user.username;

  const usernameContainer = document.getElementById("PDusername-container");
  //將使用者email顯示在畫面上
  document.getElementById("PDemail").textContent = user.email;
  //將註冊日期顯示在畫面上
  document.getElementById("PDregistrationDate").textContent = user.registrationDate;

  function renderUsername() {
    usernameContainer.innerHTML = "";
    if (editingUsername) {
      //創建編輯輸入框
      const input = document.createElement("input");
      input.type = "text";
      input.className = "PD1stInput";
      input.value = newUsername;
      input.addEventListener("input", (e) => newUsername = e.target.value);
      const saveBtn = createIconButton("✔", async () => {
        if (newUsername.trim()) {
          try {
            await updateDoc(doc(db, "users", userUID), { userName: newUsername });
            user.username = newUsername;
            loadUserName();
          } catch (error) {
            console.error("更新用戶名稱失敗：", error);
          }
          editingUsername = false;
          renderUsername();
        }
      });
      const cancelBtn = createIconButton("✖", () => {
        newUsername = user.username;
        editingUsername = false;
        renderUsername();
      });
      usernameContainer.append(input, saveBtn, cancelBtn);
    } else {
      const text = document.createElement("div");
      text.textContent = user.username;
      text.className = "PDstatic-text";
      const editBtn = createIconButton("fa-pen", () => {
        editingUsername = true;
        renderUsername();
      });
      usernameContainer.append(text, editBtn);
    }
  }


  function createIconButton(text, onClick) {
    const btn = document.createElement("button");
    if (text.startsWith("fa-")) {
      btn.innerHTML = `<i class="fas ${text}"></i>`;
    } else {
      btn.textContent = text;
    }
    btn.addEventListener("click", onClick);
    return btn;
  }

  renderUsername();
}

//綁定圖標點擊觸發檔案選擇與上傳
document.addEventListener("DOMContentLoaded", () => {
  checkUploadedImages();

  const uploadBtn = document.querySelector(".PDuploadBtn");
  const fileInput = document.getElementById("PDfileInput");

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const userUID = localStorage.getItem("userUID") || "anonymous";
      const fileExt = file.name.split(".").pop();
      const filePath = `${userUID}.jpg`;

      const uploadSign = document.getElementById("uploadSign");
      const uploadBtn = document.querySelector(".PDuploadBtn");
      if (uploadSign) {
        uploadSign.textContent = "處理中...";
        uploadSign.style.color = "black";
        if (uploadBtn) uploadBtn.style.display = "none";
      }

      // 先將圖片同步傳送至後端儲存本地檔案
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result;
        console.log("準備發送至後端，大小:", base64Data.length);
        const socket = new WebSocket("wss://not-regard-dogs-fewer.trycloudflare.com"); // 調整為實際後端位址
        socket.onopen = () => {
          console.log("✅ WebSocket 已開啟，開始傳送");
          socket.send(JSON.stringify({
            type: "sync_upload",
            userID: userUID,
            data: base64Data
          }));
        };
        socket.onmessage = async (event) => {
          console.log("後端回覆：", event.data);
          try {
            const response = JSON.parse(event.data);
            if (response.status === "ok") {
              uploadSign.textContent = "照片上傳成功";
              uploadSign.style.color = "green";
              alert(response.message);
              // 成功後再上傳圖片至 Supabase
              const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, { upsert: true });
              if (uploadError) {
                console.error("Supabase 圖片上傳失敗：", uploadError);
                alert(`Supabase 圖片上傳失敗：${uploadError.message}`);
              }
              checkUploadedImages();
              socket.close();
            } else if (response.status === "fail") {
              uploadSign.textContent = ""; // 清空提示
              uploadSign.style.color = "black";
              if (uploadBtn) uploadBtn.style.display = "inline-block";
              alert(response.message);
              checkUploadedImages();
              socket.close();
            }
          } catch (e) {
            console.error("解析後端訊息失敗：", e);
          }
        };
        socket.onerror = (err) => {
          console.error("❌ 同步傳送至後端失敗：", err);
        };
        socket.onclose = () => {
          console.log("❌ WebSocket 被關閉");
        };
      };
      reader.readAsDataURL(file);
    });
  }
});
