import { loadEventManagement, loadEventDetail, loadEventDDetail } from './manage.js';
import { loadCheckInRecords, loadJoinEventDetail } from './join.js';
import { startCamera, stopCamera } from './camera.js';

export function toggleSection(sectionId, eventId = null, eventName = '') {
    const allContainers = document.querySelectorAll('.container');
    const currentVisible = Array.from(allContainers).find(container => !container.classList.contains('hidden'));
    const isLeavingCheckIn = currentVisible?.id === 'checkIn';
    if (isLeavingCheckIn) stopCamera();

    const nextSection = document.getElementById(sectionId);
    const userID = document.getElementById('userContainer');
    const close_btn = document.getElementById('closeBtn');
    let movedUserContainer = false;
    let movedCloseBtn = false;

    allContainers.forEach(container => {
        if (!container.classList.contains('hidden')) {
            const elements = container.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a, p:not(#userID)');
            elements.forEach(element => element.classList.add('fade-out'));
            setTimeout(() => {
                if (userID && userID.parentNode === container) {
                    document.body.appendChild(userID);
                    movedUserContainer = true;
                }
                if (close_btn && close_btn.parentNode === container) {
                    document.body.appendChild(close_btn);
                    movedCloseBtn = true;
                }
                container.classList.add('hidden');
                elements.forEach(element => element.classList.remove('fade-out'));
            }, 300);
        }
    });

    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("Message").innerText = "";

    setTimeout(() => {
        nextSection.classList.remove('hidden');
        const nextElements = nextSection.querySelectorAll('h2, input, button:not(.back-button), div:not(#userContainer):not(#userContainer *), a');
        nextElements.forEach(element => element.classList.add('fade-in'));

        if (movedUserContainer && userID) nextSection.insertBefore(userID, nextSection.firstChild);
        if (movedCloseBtn && close_btn) nextSection.insertBefore(close_btn, nextSection.firstChild);

        setTimeout(() => {
            nextElements.forEach(element => element.classList.remove('fade-in'));
        }, 500);

        if (sectionId === 'joinRecord') loadCheckInRecords();
        if (sectionId === 'manageEvent') loadEventManagement();
        if (sectionId === 'joinEventDetail' && eventId) loadJoinEventDetail(eventId);
        if (sectionId === 'eventDetail' && eventId) loadEventDetail(eventId);
        if (sectionId === 'eventDDetail' && eventId) loadEventDDetail(eventId);
        if (sectionId === 'checkIn') {
            const checkInTitle = document.querySelector('#checkIn .title');
            if (checkInTitle) checkInTitle.textContent = eventName;

            // 延遲執行 startCamera，確保畫面已經顯示出來
            setTimeout(() => {
                startCamera();
            }, 300);
        }
    }, 300);
}
