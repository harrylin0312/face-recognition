function toggleSection(sectionId) {
    const allContainers = document.querySelectorAll('.container');
    const nextSection = document.getElementById(sectionId);

    allContainers.forEach(container => {
        if (!container.classList.contains('hidden')) {
            const elements = container.querySelectorAll('h2, input, button:not(.back-button), div, a');
            elements.forEach(element => element.classList.add('fade-out')); // 觸發淡出
            setTimeout(() => {
                container.classList.add('hidden');
                elements.forEach(element => element.classList.remove('fade-out')); // 清除淡出類別
            }, 500); // 等待淡出完成
        }
    });

    setTimeout(() => {
        nextSection.classList.remove('hidden');
        const nextElements = nextSection.querySelectorAll('h2, input, button:not(.back-button), div, a');
        nextElements.forEach(element => element.classList.add('fade-in')); // 觸發淡入
        setTimeout(() => {
            nextElements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
        }, 500); // 清除動畫類別
        if (sectionId === 'checkInRecord') {
            loadCheckInRecords();
        }
        if (sectionId === 'manageEvent') {
            loadEventManagement();
        }
    }, 500); // 與淡出時間同步
}

// 頁面載入時觸發淡入效果
document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('mainMenu');
    const elements = mainMenu.querySelectorAll('h2, input, button:not(.back-button), div, a');
    elements.forEach(element => element.classList.add('fade-in')); // 觸發初次淡入
    setTimeout(() => {
        elements.forEach(element => element.classList.remove('fade-in')); // 清除淡入類別
    }, 500); // 動畫完成後清除
});

function createEvent() {
    let eventName = document.getElementById('eventName').value;
    if (!eventName) {
        alert('請輸入活動名稱');
        return;
    }
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push({ name: eventName, members: [] });
    localStorage.setItem('events', JSON.stringify(events)); 
    alert('活動已建立');
    document.getElementById('eventName').value = '';
    loadEventManagement();
}

function joinEvent() {
    let eventCode = document.getElementById('eventCode').value;
    if (!eventCode) {
        alert('請輸入活動代碼');    
        return;
    }
    let joinedEvents = JSON.parse(localStorage.getItem('joinedEvents')) || [];
    joinedEvents.push({ name: eventCode, status: "未打卡" });
    localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents)); 
    alert('成功加入活動');
}

function loadCheckInRecords() {
    let joinedEvents = JSON.parse(localStorage.getItem('joinedEvents')) || [];
    document.getElementById('checkInRecords').innerHTML = joinedEvents.map(event => `<div class="record-item">${event.name}  <span class="${event.status === '未打卡' ? 'red' : 'green'}">${event.status}</span></div>`).join('');
}

function loadEventManagement() {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    document.getElementById('eventManagementList').innerHTML = events.map(event => `<div class="record-item">${event.name}  成員: ${event.members.length}</div>`).join('');
}
