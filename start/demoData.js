// Demo 模式資料集中管理
// 這個檔案只放展示用資料，不處理畫面、不操作 Firebase、不連接後端。

export const demoUser = {
    uid: "demo-user-001",
    userName: "Demo",
    email: "demo@example.com",
    registrationDate: "Demo 模式",
};

export const demoEvents = [
    {
        id: "DEMO001",
        name: "AI系統展示",
        hostUid: "demo-user-001",
        hostName: "Demo",
        createdAt: "2026/05/11 15:00:00",
        joined: true,
        participants: [
            {
                uid: "demo-user-001",
                name: "Demo",
                email: "demo@example.com",
                checkedIn: false,
            },
            {
                uid: "demo-user-002",
                name: "王小明",
                email: "demo001@example.com",
                checkedIn: true,
            },
            {
                uid: "demo-user-003",
                name: "李小華",
                email: "demo002@example.com",
                checkedIn: false,
            },
        ],
    },
    {
        id: "DEMO002",
        name: "資訊專題分享",
        hostUid: "demo-user-001",
        hostName: "Demo",
        createdAt: "2026/05/12 10:00:00",
        joined: true,
        participants: [
            {
                uid: "demo-user-001",
                name: "Demo",
                email: "demo@example.com",
                checkedIn: true,
            },
            {
                uid: "demo-user-004",
                name: "陳同學",
                email: "demo003@example.com",
                checkedIn: true,
            },
        ],
    },
    {
        id: "DEMO003",
        name: "校園活動簽到",
        hostUid: "demo-user-001",
        hostName: "Demo",
        createdAt: "2026/05/13 14:00:00",
        joined: true,
        participants: [
            {
                uid: "demo-user-001",
                name: "Demo",
                email: "demo@example.com",
                checkedIn: false,
            },
            {
                uid: "demo-user-005",
                name: "林同學",
                email: "demo004@example.com",
                checkedIn: false,
            },
            {
                uid: "demo-user-006",
                name: "張同學",
                email: "demo005@example.com",
                checkedIn: true,
            },
        ],
    },
];

export function getDemoEventById(eventID) {
    return demoEvents.find(event => event.id === eventID) || null;
}

export function getDemoJoinedEvents() {
    return demoEvents.filter(event => event.joined);
}

export function getDemoParticipant(eventID, userID = demoUser.uid) {
    const event = getDemoEventById(eventID);
    if (!event) return null;
    return event.participants.find(participant => participant.uid === userID) || null;
}

export function getDemoCheckInStatus(eventID, userID = demoUser.uid) {
    const participant = getDemoParticipant(eventID, userID);
    return participant?.checkedIn ? "已打卡" : "未打卡";
}

export function getDemoCheckedInCount(eventID) {
    const event = getDemoEventById(eventID);
    if (!event) return 0;
    return event.participants.filter(participant => participant.checkedIn).length;
}
