const CELL_WIDTH = 20;
const CELL_HEIGHT = 20;

const presets = [
    {
        name: "Conway",
        bounds: {
            surviveLowerBound: 2,
            spawnLowerBound: 3,
            spawnUpperBound: 3,
            surviveUpperBound: 3
        }
    }
];

const appState = {
    bounds: presets.find((b) => b.name == "Conway").bounds,
    startingState: generateUniformState(CELL_WIDTH, CELL_HEIGHT),
    currentState: generateUniformState(CELL_WIDTH, CELL_HEIGHT),
    hertz: 5,
    running: false
};

function generateUniformState(width, height) {
    return array2d(width, height, () => false);
}

function array2d(width, height, f) {
    const output = [];
    for (var i = 0; i < width; i++) {
        output.push([]);
        for (var j = 0; j < height; j++) {
            output[i].push(f(i, j));
        }
    }
    return output;
}

function tryNeighbour(state, x, y) {
    if (state[x] === undefined) {
        return 0;
    }
    else if (state[x][y] === undefined) {
        return 0;
    }
    else {
        return state[x][y] ? 1 : 0;
    }
}

function neighbours(state, x, y) {
    return [
        tryNeighbour(state, x - 1, y - 1),
        tryNeighbour(state,     x, y - 1),
        tryNeighbour(state, x + 1, y - 1),
        tryNeighbour(state, x - 1,     y),
        tryNeighbour(state, x + 1,     y),
        tryNeighbour(state, x - 1, y + 1),
        tryNeighbour(state,     x, y + 1),
        tryNeighbour(state, x + 1, y + 1)
    ].reduce((acc, cur) => acc + cur, 0);
}

function step(state) {
    const b = appState.bounds;
    const next = generateUniformState(CELL_WIDTH, CELL_HEIGHT);
    for (var x = 0; x < state.length; x++) {
        for (var y = 0; y < state[x].length; y++) {
            const total = neighbours(state, x, y);
            if (total < b.surviveLowerBound) {
                next[x][y] = false;
            }
            else if (total >= b.spawnLowerBound && total <= b.spawnUpperBound) {
                next[x][y] = true;
            }
            else if (total > b.surviveUpperBound) {
                next[x][y] = false;
            }
            else {
                next[x][y] = state[x][y];
            }
        }
    }
    return next;
}

function cellColour(alive) {
    if (alive) {
        return "#ffeca6";
    }
    else {
        return "#000a25";
    }
}

function updateCells(cells) {
    for (var x = 0; x < CELL_WIDTH; x++) {
        for (var y = 0; y < CELL_HEIGHT; y++) {
            cells[x][y].fill = cellColour(appState.currentState[x][y]);
        }
    }
}

/**
 * oCanvas and setup
 */

appState.startingState[4][1] = true;
appState.startingState[4][2] = true;
appState.startingState[4][3] = true;
appState.startingState[2][2] = true;
appState.startingState[3][3] = true;
appState.currentState = appState.startingState;

document.getElementById("survive-lower-bound").value = appState.bounds.surviveLowerBound;
document.getElementById("spawn-lower-bound").value = appState.bounds.spawnLowerBound;
document.getElementById("spawn-upper-bound").value = appState.bounds.spawnUpperBound;
document.getElementById("survive-upper-bound").value = appState.bounds.surviveUpperBound;
document.getElementById("hertz").value = appState.hertz;

var canvas = oCanvas.create({
    canvas: "#canvas",
    background: "#222",
    fps: 60
});

const drawCells = array2d(CELL_WIDTH, CELL_HEIGHT, (xPos, yPos) => {
    const rect = canvas.display.rectangle({
        width: canvas.width / CELL_WIDTH,
        height: canvas.height / CELL_HEIGHT,
        fill: cellColour(appState.currentState[xPos][yPos]),
        x: xPos * (canvas.width / CELL_WIDTH),
        y: yPos * (canvas.height / CELL_HEIGHT)
    }).add();
    return rect;
});

var frameCounter = 0;
canvas.setLoop(function() {
    if (appState.running) {
        frameCounter += 1;
    }
    if (frameCounter >= 60 / appState.hertz) {
        frameCounter -= 60 / appState.hertz;
        appState.currentState = step(appState.currentState);
        updateCells(drawCells);
    }
}).start();

/**
 * Event handling
 */

function resetState() {
    appState.currentState = appState.startingState;
    updateCells(drawCells);
    appState.running = false;
}

document.getElementById("start-button").addEventListener("click", function(button) {
    if (appState.running) {
        button.target.value = "Start";
        resetState();
    }
    else {
        button.target.value = "Reset";
        appState.running = true;
    }
});

document.getElementById("pause-button").addEventListener("click", function() {
    appState.running = !appState.running;
});

document.getElementById("config-form").addEventListener("input", function() {
    resetState();
    document.getElementById("start-button").value = "Start";
    appState.bounds.surviveLowerBound = document.getElementById("survive-lower-bound").value;
    appState.bounds.spawnLowerBound = document.getElementById("spawn-lower-bound").value;
    appState.bounds.spawnUpperBound = document.getElementById("spawn-upper-bound").value;
    appState.bounds.surviveUpperBound = document.getElementById("survive-upper-bound").value;
    appState.hertz = document.getElementById("hertz").value;
});