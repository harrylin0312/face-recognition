import { db } from "./script2.js";
import { loadUserName } from './script2.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const BUCKET_NAME = "face123";

const supabase = createClient("https://wiqldwmpszfinwbdegrs.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcWxkd21wc3pmaW53YmRlZ3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTUyNTQsImV4cCI6MjA2NDUzMTI1NH0.gbPCAFdTdEcl8-1C4OnNlp2G0YGue6kd1N9cvxmqiUA");

async function checkUploadedImages() {
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
    uploadSign.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 請上傳清晰的個人臉部影像`;
    uploadSign.style.color = "red";
    uploadBtn.style.display = "inline-block";
  } else {
    uploadSign.textContent = "已完成上傳";
    uploadSign.style.color = "green";
    uploadBtn.style.display = "none";
  }
}

export async function loadPersonalData() {
  const userUID = localStorage.getItem("userUID");
  if (!userUID) {
    document.getElementById("PDusername-container").textContent = "未登入";
    document.getElementById("PDemail").textContent = "";
    document.getElementById("PDregistrationDate").textContent = "(未知)";
    document.getElementById("PDpassword-container").textContent = "";
    return;
  }
  const userDocRef = doc(db, "users", userUID);
  const userSnap = await getDoc(userDocRef);

  //預設資料
  const user = {
    username: userSnap.exists() ? (userSnap.data().userName || "") : "",
    email: userSnap.exists() ? (userSnap.data().email || "") : "",
    password: "••••••••",
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
  let editingPassword = false;
  let showPassword = false;
  let newUsername = user.username;
  let newPassword = "";
  let oldPassword = "";

  const usernameContainer = document.getElementById("PDusername-container");
  const passwordContainer = document.getElementById("PDpassword-container");
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

  function renderPassword() {
    passwordContainer.innerHTML = "";
    if (editingPassword) {
      const oldInput = document.createElement("input");
      oldInput.type = showPassword ? "text" : "password";
      oldInput.placeholder = "舊密碼";
      oldInput.className = "PD1stInput";
      oldInput.value = oldPassword;
      oldInput.addEventListener("input", (e) => oldPassword = e.target.value);

      const newInput = document.createElement("input");
      newInput.type = showPassword ? "text" : "password";
      newInput.placeholder = "新密碼";
      newInput.className = "PD2ndInput";
      newInput.value = newPassword;
      newInput.addEventListener("input", (e) => newPassword = e.target.value);

      const toggleBtn = createIconButton(showPassword ? "fa-eye-slash" : "fa-eye", () => {
        showPassword = !showPassword;
        renderPassword();
      });

      const saveBtn = createIconButton("✔", async () => {
        if (oldPassword.trim() && newPassword.trim()) {
          const auth = getAuth();
          const currentUser = auth.currentUser;
          if (!currentUser) {
            user.password = "尚未登入";
            renderPassword();
            return;
          }
          const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
          try {
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            user.password = "••••••••";
            oldPassword = "";
            newPassword = "";
            editingPassword = false;
            showPassword = false;
          } catch (error) {
            console.error("密碼更新失敗：", error);
            switch (error.code) {
              case "auth/wrong-password":
                user.password = "舊密碼錯誤，請再試一次。";
                break;
              case "auth/too-many-requests":
                user.password = "請稍後再試，登入次數過多。";
                break;
              case "auth/weak-password":
                user.password = "新密碼太弱，請使用更複雜的密碼。";
                break;
              default:
                user.password = "密碼更新失敗，請稍後再試。";
            }
          }
          renderPassword();
        }
      });

      const cancelBtn = createIconButton("✖", () => {
        oldPassword = "";
        newPassword = "";
        editingPassword = false;
        showPassword = false;
        renderPassword();
      });

      // 顯示舊密碼與新密碼輸入欄位，切換可視按鈕，儲存與取消按鈕
      passwordContainer.append(oldInput, newInput, toggleBtn, saveBtn, cancelBtn);
    } else {
      const text = document.createElement("div");
      text.textContent = user.password;
      text.className = "PDstatic-text";
      const editBtn = createIconButton("fa-pen", () => {
        editingPassword = true;
        renderPassword();
      });
      // 顯示遮蔽的密碼與編輯按鈕
      passwordContainer.append(text, editBtn);
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
  renderPassword();
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

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("圖片上傳失敗：", uploadError);
        console.log("Supabase 上傳錯誤訊息：", uploadError);
        alert("圖片上傳失敗。");
        alert("錯誤訊息：" + uploadError.message);
        console.error("上傳失敗詳情：", uploadError);
        return;
      }

      alert("圖片上傳成功！");
      checkUploadedImages();
    });
  }
});
