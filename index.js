let timeLeftGroup, timeRightGroup, hourLeftGroup, hourRightGroup, minuteLeftGroup, minuteMiddleGroup, minuteRightGroup, minuteElement;
let timeGroups, hourGroups, minuteGroups;
let curModeElement;

let timeUpdater = null;
let hour = 1;
let minute = 0;

function increaseHour() {
    hour++;
    if (hour > 24) {
        hour = 1;
    }
    redraw();
    setCurTimeMode(false);
}
function decreaseHour() {
    hour--;
    if (hour < 1) {
        hour = 24;
    }
    redraw();
    setCurTimeMode(false);
}
function increaseMinute() {
    minute++;
    if (minute > 59) {
        minute = 0;
        increaseHour();
    }
    redraw();
    setCurTimeMode(false);
}
function decreaseMinute() {
    minute--;
    if (minute < 0) {
        minute = 59;
        decreaseHour();
    }
    redraw();
    setCurTimeMode(false);
}

//11, 18 -> 29              | 30    5 6     11
//5, 25, 1 -> 30 + 1        | 30    5 6     11
//11, 13, 19, 1 -> 43 + 1   | 44    7 7     14
//36 -> 시프트 레지스터 5개

const timeData = [ //11, 18
    [[1, 4, 5, 6, 7], [4, 5, 6, 7, 9, 11, 12, 16]],         //새벽
    [[1, 2, 5, 7, 8, 9], [0, 1, 2, 4, 6, 9, 12, 13, 16, 17]],  //아침
    [[1, 2, 3, 7, 9, 10], [1, 2, 4, 6, 8, 9, 13, 17]],             //오전
    [[], [4, 11, 9, 10, 12, 14]],                           //낮
    [[1, 2, 3, 7, 9, 10], [0, 1, 2, 3, 4, 9, 11, 12, 15]],      //오후
    [[0, 1, 2, 5, 6, 7], [4, 11, 7, 9, 12, 16]],               //저녁
    [[], [4, 5, 6, 9, 10, 11, 12, 13, 16, 17]]              //밤
]

/*const hourData = [
    [[], []],
    [[], [0, 1, 2, 4, 5, 10, 11, 12, 17, 22]], 
    [[], [2, 3, 4, 12, 13, 15, 16, 19]], 
    [[], [2, 4, 5, 6, 7, 10]], 
    [[], [4, 6, 7, 10, 12]], 
    [[0, 3], [2, 4, 5, 9, 10, 16, 18, 21]], 
    [[0, 1, 2], [2, 4, 5, 9, 10, 16, 18, 21]], 
    [[0, 1, 4], [1, 2, 3, 10, 14, 17, 20, 21, 22]], 
    [[0, 1, 2], [2, 4, 9, 10, 12, 15, 18, 19, 20, 21, 22]], 
    [[0, 1, 3], [0, 1, 2, 3, 4, 10, 12, 13, 14, 17, 20, 21, 22]], 
    [[], [2, 4, 5, 8, 10, 12, 15, 18, 22]],
    [[0, 1, 2, 4], [0, 1, 2, 4, 5, 10, 11, 12, 17, 22]], 
    [[0, 1, 2, 4], [2, 3, 4, 12, 13, 15, 16, 19]], 
];*/

const hourData = [ //5, 25
    [[], []],
    [[], [0, 1, 2, 3, 5, 8, 11, 12, 13, 14, 19, 24]],
    [[], [2, 3, 4, 5, 13, 14, 15, 17, 18, 21]],
    [[], [2, 5, 6, 7, 8, 11]],
    [[], [5, 7, 8, 11, 13]],
    [[0, 3], [2, 3, 5, 8, 10, 11, 18, 20, 23]],
    [[0, 1, 2], [2, 3, 5, 8, 10, 11, 18, 20, 23]],
    [[0, 1, 4], [1, 2, 3, 4, 11, 16, 19, 22, 23, 24]],
    [[0, 1, 2], [2, 3, 5, 10, 11, 13, 14, 17, 20, 21, 22, 23, 24]],
    [[0, 1, 3], [0, 1, 2, 3, 4, 5, 11, 13, 14, 15, 16, 19, 22, 23, 24]],
    [[], [2, 3, 5, 8, 9, 11, 13, 14, 17, 20, 24]],
    [[0, 1, 2, 4], [0, 1, 2, 3, 5, 8, 11, 12, 13, 14, 19, 24]],
    [[0, 1, 2, 4], [2, 3, 4, 5, 13, 14, 15, 17, 18, 21]]
]
/*
const minuteData = [ //19
    [],
    [2, 4, 5, 6, 8, 11, 14, 18],
    [2, 4, 5, 6, 8],
    [2, 4, 5, 6, 7, 11, 12, 13, 17, 18],
    [2, 4, 5, 6, 7],
    [2, 3, 4, 6, 8, 9, 15, 18],
    [2, 3, 4, 6, 8, 9, 10, 11, 12, 17],
    [0, 1, 2, 4, 5, 6, 11, 14, 18],
    [1, 2, 4, 5, 8, 6, 7, 11, 14, 18],
    [1, 2, 3, 6, 11, 12, 15],
    [2, 4, 5, 6, 13, 16, 17, 18]
];
*/
const minuteData = [ //11, 13, 19
[[], [], []],
[[0, 2, 3, 5, 6, 8, 10], [0, 2, 3, 5, 6, 9, 12], [2, 4, 5, 6, 8, 11, 14, 18]],
[[0, 2, 3, 5], [0, 2, 3, 5], [2, 4, 5, 6, 8]],
[[0, 2, 3, 4, 6, 7, 10], [0, 2, 3, 4, 6, 7, 8, 12], [2, 4, 5, 6, 7, 11, 12, 13, 17, 18]],
[[0, 2, 3, 4], [0, 2, 3, 4], [2, 4, 5, 6, 7]],
[[0, 1, 3, 5, 9, 10], [0, 1, 3, 5, 10, 12], [2, 3, 4, 6, 8, 9, 15, 18]],
[[], [], [2, 3, 4, 6, 8, 9, 10, 11, 12, 17]],
[[], [], [0, 1, 2, 4, 5, 6, 11, 14, 18]],
[[], [], [1, 2, 4, 5, 8, 6, 7, 11, 14, 18]],
[[], [], [1, 2, 3, 6, 11, 12, 15]],
[[], [0, 2, 3, 8, 11, 12], [2, 4, 5, 6, 13, 16, 17, 18]]
];

function redraw() {
    redrawTime();
    redrawHour();
    redrawMinute();
}

function redrawTime() {
    let timeIndex = 0;
    if(hour >= 6)
        timeIndex++;
    if(hour >= 9)
        timeIndex++;
    if(hour >= 12)
        timeIndex++;
    if(hour >= 13)
        timeIndex++;
    if(hour >= 19)
        timeIndex++;
    if(hour >= 22)
        timeIndex++;

    applyVisibility(timeGroups[0], timeData[timeIndex][0]);
    applyVisibility(timeGroups[1], timeData[timeIndex][1]);
}

function redrawHour() {
    let twelveHour = hour % 12;
    if(twelveHour == 0) {
        twelveHour = 12;
    }
    applyVisibility(hourGroups[0], hourData[twelveHour][0]);
    applyVisibility(hourGroups[1], hourData[twelveHour][1]);
}

function redrawMinute() {
    const minuteLeft = Math.floor(minute / 10);
    const minuteRight = minute % 10;
    
    let curIndex = 2;
    if(minuteRight > 0) {
        applyVisibility(minuteGroups[curIndex], minuteData[minuteRight][curIndex]);
        curIndex--;
    }
    if(minuteLeft > 0) {
        applyVisibility(minuteGroups[curIndex], minuteData[10][curIndex]);
        curIndex--;
    }
    if(minuteLeft > 1) {
        applyVisibility(minuteGroups[curIndex], minuteData[minuteLeft][curIndex]);
        curIndex--;
    }

    minuteElement.style.fill = (curIndex < 2 ? ON_COLOR : OFF_COLOR);

    for (let i = curIndex; i >= 0; i--) {
        applyVisibility(minuteGroups[i], []);
    }
}

const ON_COLOR = "#010101";
//const OFF_COLOR = "#888A7E";
const OFF_COLOR = "#9D9F93";

function applyVisibility(svg, indices) {
    for (let i = 0; i < svg.children.length; i++) {
        const child = svg.children[i];
        if(child.tagName == "g") {
            for(let j = 0; j < child.children.length; j++) {
                const element = child.children[j];
                element.style.fill = (indices.includes(i) ? ON_COLOR : OFF_COLOR);
            }
        } else {
            child.style.fill = (indices.includes(i) ? ON_COLOR : OFF_COLOR);
        }
    }
}

function setCurTimeMode(shouldEnable) {
    if(shouldEnable) {
        if(timeUpdater == null) {
            timeUpdater = setInterval(updateTime, 500);
            updateTime();
        }
    } else {
        if(timeUpdater != null) {
            clearInterval(timeUpdater);
            timeUpdater = null;
        }
    }
    curModeElement.innerText = shouldEnable ? "자동" : "수동";
}

function toggleCurTimeMode() {
    if(timeUpdater == null) {
        timeUpdater = setInterval(updateTime, 500);
        updateTime();
        curModeElement.innerText = "자동";
    } else {
        clearInterval(timeUpdater);
        timeUpdater = null;
        curModeElement.innerText = "수동";
    }
}

function updateTime() {
    let today = new Date();
    hour = today.getHours();
    if(hour == 0) {
        hour = 24;
    }
    minute = today.getMinutes();
    redraw();
}

window.onload = function() {
    timeLeftGroup = document.getElementById("time-left").getSVGDocument().children[0].children[1];
    timeRightGroup = document.getElementById("time-right").getSVGDocument().children[0].children[1];
    timeGroups = [timeLeftGroup, timeRightGroup];

    hourLeftGroup = document.getElementById("hour-left").getSVGDocument().children[0].children[1];
    hourRightGroup = document.getElementById("hour-right").getSVGDocument().children[0].children[1];
    hourGroups = [hourLeftGroup, hourRightGroup];

    minuteLeftGroup = document.getElementById("minute-left").getSVGDocument().children[0].children[1];
    minuteMiddleGroup = document.getElementById("minute-middle").getSVGDocument().children[0].children[1];
    minuteRightGroup = document.getElementById("minute-right").getSVGDocument().children[0].children[1];
    minuteGroups = [minuteLeftGroup, minuteMiddleGroup, minuteRightGroup];

    minuteElement = document.getElementById("minute").getSVGDocument().children[0].children[1].children[0];

    curModeElement = document.getElementById("current-mode");

    setCurTimeMode(true);
}

window.onkeydown = function(e) {
    switch (e.key) {
        case "ArrowUp":
            decreaseHour();
			e.preventDefault();
            break;
        case "ArrowDown":
            increaseHour();
			e.preventDefault();
            break;
        case "ArrowRight":
            increaseMinute();
			e.preventDefault();
            break;
        case "ArrowLeft":
            decreaseMinute();
			e.preventDefault();
            break;
        case " ":
            setCurTimeMode(true);
            e.preventDefault();
            break;
    }
}
