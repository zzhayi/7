const dino = document.getElementById('dino');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const instructions = document.getElementById('instructions');
const gameOverDisplay = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

let score = 0;
let isJumping = false;
let isGameOver = false;
let gameSpeed = 5; // 初始速度 (像素/幀)
let obstacleInterval;
let gameLoopInterval;
let scoreInterval;
let obstacleSpawnTimer = 2000; // 初始生成間隔 (毫秒)

// --- 跳躍功能 ---
function jump() {
    if (!isJumping && !isGameOver) {
        isJumping = true;
        dino.classList.add('jump');
        instructions.style.display = 'none'; // 開始遊戲後隱藏提示

        // 等待跳躍動畫結束後移除 class，並允許再次跳躍
        setTimeout(() => {
            dino.classList.remove('jump');
            isJumping = false;
        }, 600); // 必須與 CSS 中的動畫時間一致
    }
}

// 監聽空白鍵和點擊事件
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        jump();
    }
});
gameContainer.addEventListener('click', jump);

// --- 障礙物處理 ---
function createObstacle() {
    if (isGameOver) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    // 隨機仙人掌大小 (可選)
    // let randomHeight = Math.random() * 20 + 30; // 30-50px 高
    // obstacle.style.height = randomHeight + 'px';
    obstacle.style.right = '-30px'; // 從右側畫面外開始
    gameContainer.appendChild(obstacle);

    moveObstacle(obstacle);
}

function moveObstacle(obstacle) {
    let obstaclePosition = gameContainer.offsetWidth + 30; // 從容器寬度外開始

    let moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval);
            return;
        }

        obstaclePosition -= gameSpeed;
        obstacle.style.right = (gameContainer.offsetWidth - obstaclePosition) + 'px';

        // 移除超出左邊界線的障礙物
        if (obstaclePosition < -obstacle.offsetWidth) {
            clearInterval(moveInterval);
            obstacle.remove();
        }

        // 碰撞檢測
        checkCollision(obstacle);

    }, 20); // 控制障礙物移動平滑度
}

// --- 碰撞檢測 ---
function checkCollision(obstacle) {
    if (isGameOver) return;

    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // 簡單的邊界盒碰撞檢測
    if (
        dinoRect.left < obstacleRect.right &&
        dinoRect.right > obstacleRect.left &&
        dinoRect.top < obstacleRect.bottom &&
        dinoRect.bottom > obstacleRect.top
    ) {
        // 碰撞發生
        gameOver();
    }
}

// --- 計分 ---
function updateScore() {
    score++;
    scoreDisplay.textContent = `分數: ${score}`;

    // 隨分數增加遊戲速度 (可選)
    if (score % 100 === 0 && gameSpeed < 15) { // 每100分加速，設定速度上限
        gameSpeed += 0.5;
        console.log("Speed increased to: ", gameSpeed);
        // 稍微加快障礙物生成速度
        if (obstacleSpawnTimer > 800) { // 設定生成速度下限
             obstacleSpawnTimer -= 50;
             clearInterval(obstacleInterval);
             obstacleInterval = setInterval(createObstacle, obstacleSpawnTimer);
             console.log("Obstacle spawn timer: ", obstacleSpawnTimer);
        }
    }
}

// --- 遊戲結束與重新開始 ---
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(scoreInterval);
    clearInterval(obstacleInterval); // 停止生成新的障礙物

    // 停止所有現存障礙物的移動 (透過moveObstacle內的檢查)
    gameOverDisplay.style.display = 'block'; // 顯示遊戲結束畫面
    instructions.style.display = 'none';

    console.log("Game Over! Final Score:", score);
}

function restartGame() {
    // 重置所有變數
    score = 0;
    isJumping = false;
    isGameOver = false;
    gameSpeed = 5;
    obstacleSpawnTimer = 2000;
    scoreDisplay.textContent = `分數: 0`;
    gameOverDisplay.style.display = 'none';
    instructions.style.display = 'block';

    // 移除所有殘留的障礙物
    const existingObstacles = document.querySelectorAll('.obstacle');
    existingObstacles.forEach(obs => obs.remove());

    // 清除可能殘留的計時器
    clearInterval(gameLoopInterval);
    clearInterval(scoreInterval);
    clearInterval(obstacleInterval);

    // 重新開始遊戲循環
    startGame();
}

restartButton.addEventListener('click', restartGame);

// --- 遊戲啟動 ---
function startGame() {
    console.log("Game Started!");
    isGameOver = false; // 確保是可玩狀態
    // 使用 setInterval 控制遊戲的主要循環（障礙物生成、計分）
    // 注意：障礙物移動已在 moveObstacle 內由各自的 setInterval 控制

    // 定期生成障礙物
    obstacleInterval = setInterval(createObstacle, obstacleSpawnTimer);

    // 定期更新分數
    scoreInterval = setInterval(updateScore, 100); // 每 100ms 加一分

    // gameLoopInterval 現在主要用於檢查遊戲狀態或未來擴展，
    // 因為移動和碰撞已分散處理。可以保留用於增加難度等。
    // gameLoopInterval = setInterval(() => {
    //    if(isGameOver) {
    //        clearInterval(gameLoopInterval);
    //    }
        // 可以在這裡加入其他全局邏輯
    // }, 50);

}

// 頁面載入後自動開始遊戲 (或者你可以改成按鈕觸發)
window.onload = () => {
    // 初始不自動開始，等待玩家互動
    // startGame(); // 如果想自動開始，取消這行註解
    instructions.textContent = '按空白鍵或點擊螢幕開始遊戲並跳躍';
    // 第一次互動時才真正啟動計時器
    function firstInteraction() {
        if (!gameLoopInterval && !isGameOver) { // 避免重複啟動
             startGame();
             jump(); // 第一次互動通常是跳躍
             // 移除首次互動監聽器
             document.removeEventListener('keydown', firstInteractionHandler);
             gameContainer.removeEventListener('click', firstInteractionHandler);
        }
    }
    const firstInteractionHandler = (event) => {
        if (event.type === 'keydown' && event.code === 'Space') {
            firstInteraction();
        } else if (event.type === 'click') {
            firstInteraction();
        }
    };
    document.addEventListener('keydown', firstInteractionHandler);
    gameContainer.addEventListener('click', firstInteractionHandler);
};