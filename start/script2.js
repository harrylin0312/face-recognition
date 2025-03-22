function toggleSection(sectionId) {
    document.querySelectorAll('.container').forEach(div => {
        div.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'checkInRecord') {
        loadCheckInRecords();
    }
    if (sectionId === 'manageEvent') {
        loadEventManagement();
    }
}

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
