document.addEventListener("DOMContentLoaded", () => {
    const boardSize = 4;
    let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;

    const tileImages = {
        2: "2.jpg",
        4: "4.jpg",
        8: "8.jpg",
        16: "16.jpg",
        32: "32.jpg",
        64: "64.jpg",
        128: "128.jpg",
        256: "256.jpg",
        512: "512.jpg",
        1024: "1024.jpg",
        2048: "2048.jpg"
    };

    function initBoard() {
        document.getElementById("high-score").textContent = highScore;
        document.getElementById("game-over").style.display = "none";
        const gameBoard = document.getElementById("game-board");
        gameBoard.innerHTML = "";
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                let tile = document.createElement("div");
                tile.id = `tile-${row}-${col}`;
                tile.classList.add("tile");
                gameBoard.appendChild(tile);
            }
        }
        board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
        score = 0;
        addRandomTile();
        addRandomTile();
        updateBoard();
    }

    function addRandomTile() {
        let emptyTiles = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 0) emptyTiles.push({ row, col });
            }
        }
        if (emptyTiles.length > 0) {
            let { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            board[row][col] = Math.random() > 0.1 ? 2 : 4;
        }
    }

    function updateBoard() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                let tile = document.getElementById(`tile-${row}-${col}`);
                let value = board[row][col];
                tile.style.backgroundImage = value ? `url(${tileImages[value]})` : "none";
                tile.classList.remove("merged");
            }
        }
        document.getElementById("score").textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            document.getElementById("high-score").textContent = highScore;
        }
        checkGameOver();
    }

    function checkGameOver() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 0) return;
                if (col < boardSize - 1 && board[row][col] === board[row][col + 1]) return;
                if (row < boardSize - 1 && board[row][col] === board[row + 1][col]) return;
            }
        }
        document.getElementById("game-over").style.display = "block";
    }

    function slideRow(row) {
        let filteredRow = row.filter(num => num);
        let emptySpaces = Array(boardSize - filteredRow.length).fill(0);
        return [...filteredRow, ...emptySpaces];
    }

    function combineRow(row) {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] !== 0 && row[i] === row[i + 1]) {
                row[i] *= 2;
                score += row[i];
                row[i + 1] = 0;
                document.getElementById(`tile-${i}-${i}`).classList.add("merged");
            }
        }
        return row.filter(num => num).concat(Array(boardSize - row.filter(num => num).length).fill(0));
    }

    function moveTiles(direction) {
        let rotated = false;
        if (direction === "up" || direction === "down") {
            board = transpose(board);
            rotated = true;
        }

        for (let i = 0; i < boardSize; i++) {
            if (direction === "right" || direction === "down") {
                board[i] = slideRow(board[i].reverse()).reverse();
                board[i] = combineRow(board[i].reverse()).reverse();
            } else {
                board[i] = slideRow(board[i]);
                board[i] = combineRow(board[i]);
            }
        }

        if (rotated) board = transpose(board);
        addRandomTile();
        updateBoard();
    }

    function transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    // **Keyboard Controls (PC)**
    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowUp":
                moveTiles("up");
                break;
            case "ArrowDown":
                moveTiles("down");
                break;
            case "ArrowLeft":
                moveTiles("left");
                break;
            case "ArrowRight":
                moveTiles("right");
                break;
        }
    });

    // **Swipe Controls (Mobile)**
    let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

    document.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener("touchmove", (e) => {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener("touchend", () => {
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) moveTiles("right");
            else if (dx < -50) moveTiles("left");
        } else {
            if (dy > 50) moveTiles("down");
            else if (dy < -50) moveTiles("up");
        }
    });

    document.getElementById("reset-btn").addEventListener("click", initBoard);

    initBoard();
});
