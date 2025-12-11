// 게임 상태
let cards = [];
let flippedCards = [];
let matchedPairs = [];
let moves = 0;
let startTime = null;
let timerInterval = null;
let isProcessing = false;

// 카드 이모지 (8쌍)
const cardEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

// 게임 초기화
function initGame() {
    // 상태 초기화
    cards = [];
    flippedCards = [];
    matchedPairs = [];
    moves = 0;
    isProcessing = false;
    
    // 타이머 초기화
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    startTime = null;
    updateTimer();
    updateMoves();
    
    // 카드 생성
    createCards();
    
    // 게임 보드 렌더링
    renderBoard();
}

// 카드 생성 및 섞기
function createCards() {
    // 카드 쌍 생성
    const cardPairs = [...cardEmojis, ...cardEmojis];
    
    // Fisher-Yates 셔플 알고리즘
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    // 카드 객체 생성
    cards = cardPairs.map((emoji, index) => ({
        id: index,
        emoji: emoji,
        isFlipped: false,
        isMatched: false,
        isMismatch: false
    }));
}

// 게임 보드 렌더링
function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        if (card.isMatched) {
            cardElement.classList.add('matched');
        }
        if (card.isFlipped) {
            cardElement.classList.add('flipped');
        }
        if (card.isMismatch) {
            cardElement.classList.add('mismatch');
            // 애니메이션 후 클래스 제거
            setTimeout(() => {
                cardElement.classList.remove('mismatch');
                card.isMismatch = false;
            }, 500);
        }
        
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${card.emoji}</div>
                <div class="card-back"></div>
            </div>
        `;
        
        // 모바일 터치 이벤트 최적화
        cardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCardClick(index);
        }, { passive: false });
        
        cardElement.addEventListener('click', () => handleCardClick(index));
        
        gameBoard.appendChild(cardElement);
        
        // 모바일에서 렌더링 강제 (GPU 가속)
        if (cardElement.offsetParent !== null) {
            cardElement.style.transform = 'translateZ(0)';
        }
    });
}

// 카드 클릭 처리
function handleCardClick(index) {
    const card = cards[index];
    
    // 이미 뒤집혔거나 매칭되었거나 처리 중이면 무시
    if (card.isFlipped || card.isMatched || isProcessing || flippedCards.length >= 2) {
        return;
    }
    
    // 게임 시작 시간 기록
    if (startTime === null) {
        startTime = Date.now();
        startTimer();
    }
    
    // 카드 뒤집기
    card.isFlipped = true;
    flippedCards.push(index);
    renderBoard();
    
    // 두 장의 카드가 뒤집혔으면 매칭 확인
    if (flippedCards.length === 2) {
        moves++;
        updateMoves();
        isProcessing = true;
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

// 매칭 확인
function checkMatch() {
    const [index1, index2] = flippedCards;
    const card1 = cards[index1];
    const card2 = cards[index2];
    
    if (card1.emoji === card2.emoji) {
        // 매칭 성공 - 애니메이션 효과를 위해 약간의 지연
        setTimeout(() => {
            card1.isMatched = true;
            card2.isMatched = true;
            matchedPairs.push(index1, index2);
            renderBoard();
            
            // 게임 완료 확인
            if (matchedPairs.length === cards.length) {
                setTimeout(() => {
                    endGame();
                }, 800);
            }
        }, 300);
    } else {
        // 매칭 실패 - 흔들림 애니메이션 추가
        card1.isMismatch = true;
        card2.isMismatch = true;
        renderBoard();
        
        setTimeout(() => {
            card1.isFlipped = false;
            card2.isFlipped = false;
            card1.isMismatch = false;
            card2.isMismatch = false;
            renderBoard();
        }, 500);
    }
    
    // 상태 초기화
    flippedCards = [];
    isProcessing = false;
}

// 타이머 시작
function startTimer() {
    timerInterval = setInterval(() => {
        updateTimer();
    }, 1000);
}

// 타이머 업데이트
function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (startTime === null) {
        timerElement.textContent = '00:00';
        return;
    }
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 시도 횟수 업데이트
function updateMoves() {
    document.getElementById('moves').textContent = moves;
}

// 게임 종료
function endGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-time').textContent = formatTime(elapsed);
    
    // 모달 표시
    const modal = document.getElementById('game-complete-modal');
    modal.classList.add('show');
}

// 시간 포맷팅
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Supabase 초기화 확인 및 재시도
function ensureSupabaseInit() {
    if (!supabaseClient && typeof initSupabase === 'function') {
        initSupabase();
    }
    return supabaseClient !== null;
}

// 점수 저장
async function saveScore() {
    const playerName = document.getElementById('player-name').value.trim() || '익명';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    // Supabase 초기화 확인
    if (!ensureSupabaseInit()) {
        alert('Supabase가 설정되지 않았습니다. 페이지를 새로고침해주세요.');
        console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
        return;
    }
    
    try {
        const matchedPairsCount = matchedPairs.length / 2; // 매칭된 쌍의 수
        const totalPairsCount = 8; // 전체 쌍의 수
        
        const { data, error } = await supabaseClient
            .from('card_game_scores')
            .insert([
                {
                    player_name: playerName,
                    score: moves, // 시도 횟수를 점수로 사용
                    time_seconds: elapsed,
                    moves: moves,
                    matched_pairs: matchedPairsCount,
                    total_pairs: totalPairsCount
                }
            ]);
        
        if (error) {
            console.error('점수 저장 오류:', error);
            alert('점수 저장에 실패했습니다: ' + error.message);
        } else {
            alert('점수가 저장되었습니다!');
            document.getElementById('player-name').value = '';
        }
    } catch (error) {
        console.error('점수 저장 오류:', error);
        alert('점수 저장에 실패했습니다.');
    }
}

// 리더보드 조회
async function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '<p class="loading">로딩 중...</p>';
    
    // Supabase 초기화 확인
    if (!ensureSupabaseInit()) {
        leaderboardList.innerHTML = '<p>Supabase가 설정되지 않았습니다. 페이지를 새로고침해주세요.</p>';
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('card_game_scores')
            .select('*')
            .order('score', { ascending: true })
            .order('time_seconds', { ascending: true })
            .limit(10);
        
        if (error) {
            console.error('리더보드 조회 오류:', error);
            leaderboardList.innerHTML = '<p>리더보드를 불러올 수 없습니다.</p>';
            return;
        }
        
        if (!data || data.length === 0) {
            leaderboardList.innerHTML = '<p>아직 기록이 없습니다.</p>';
            return;
        }
        
        leaderboardList.innerHTML = '';
        data.forEach((record, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">${record.player_name || '익명'}</span>
                <div class="leaderboard-score">
                    <div>시도: ${record.moves}회</div>
                    <div>시간: ${formatTime(record.time_seconds)}</div>
                </div>
            `;
            leaderboardList.appendChild(item);
        });
    } catch (error) {
        console.error('리더보드 조회 오류:', error);
        leaderboardList.innerHTML = '<p>리더보드를 불러올 수 없습니다.</p>';
    }
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // Supabase 초기화 확인
    setTimeout(() => {
        if (!supabaseClient && typeof initSupabase === 'function') {
            initSupabase();
        }
        if (supabaseClient) {
            console.log('✅ 게임 시작: Supabase 연결 확인됨');
        } else {
            console.warn('⚠️ 게임 시작: Supabase 연결 확인 필요');
        }
    }, 200);
    
    // 새 게임 버튼
    document.getElementById('new-game-btn').addEventListener('click', () => {
        initGame();
    });
    
    // 다시 하기 버튼
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('game-complete-modal').classList.remove('show');
        initGame();
    });
    
    // 점수 저장 버튼
    document.getElementById('save-score-btn').addEventListener('click', () => {
        saveScore();
    });
    
    // 리더보드 버튼
    document.getElementById('leaderboard-btn').addEventListener('click', () => {
        const modal = document.getElementById('leaderboard-modal');
        modal.classList.add('show');
        loadLeaderboard();
    });
    
    // 리더보드 닫기 버튼
    document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
        document.getElementById('leaderboard-modal').classList.remove('show');
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('game-complete-modal').addEventListener('click', (e) => {
        if (e.target.id === 'game-complete-modal') {
            e.target.classList.remove('show');
        }
    });
    
    document.getElementById('leaderboard-modal').addEventListener('click', (e) => {
        if (e.target.id === 'leaderboard-modal') {
            e.target.classList.remove('show');
        }
    });
    
    // Enter 키로 점수 저장
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveScore();
        }
    });
    
    // 게임 초기화
    initGame();
    
    // 드래그 기능 추가 (모바일 전용)
    if (window.innerWidth < 768) {
        initDragContainer();
    }
    
    // 화면 크기 변경 시 드래그 기능 토글
    window.addEventListener('resize', () => {
        const container = document.querySelector('.container');
        if (window.innerWidth < 768 && !container.hasAttribute('data-drag-initialized')) {
            initDragContainer();
        } else if (window.innerWidth >= 768) {
            container.removeAttribute('data-drag-initialized');
            container.style.transform = 'translateX(-50%)';
        }
    });
});

// 컨테이너 드래그 기능
function initDragContainer() {
    const container = document.querySelector('.container');
    if (container.hasAttribute('data-drag-initialized')) return;
    
    container.setAttribute('data-drag-initialized', 'true');
    
    let isDragging = false;
    let startY = 0;
    let startTranslateY = 0;
    let currentTranslateY = 0;
    
    // 터치 이벤트
    container.addEventListener('touchstart', handleDragStart, { passive: false });
    container.addEventListener('touchmove', handleDragMove, { passive: false });
    container.addEventListener('touchend', handleDragEnd, { passive: false });
    
    // 마우스 이벤트 (데스크톱에서도 테스트용)
    container.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    function handleDragStart(e) {
        // 헤더나 드래그 핸들 영역에서만 드래그 시작
        const target = e.target;
        const header = document.querySelector('header');
        const isHeaderArea = header && (header.contains(target) || target === header || target === container);
        
        if (!isHeaderArea && !target.closest('header')) {
            return;
        }
        
        isDragging = true;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startY = clientY;
        
        // 현재 위치 가져오기
        const rect = container.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(container);
        const matrix = new DOMMatrix(computedStyle.transform);
        startTranslateY = matrix.m42 || 0;
        
        container.style.transition = 'none';
        container.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    function handleDragMove(e) {
        if (!isDragging) return;
        
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - startY;
        currentTranslateY = startTranslateY + deltaY;
        
        // 최소/최대 위치 제한
        const maxTranslateY = 0; // 원래 위치 (하단)
        const minTranslateY = -(window.innerHeight * 0.7); // 최대 위로 올릴 수 있는 거리
        
        currentTranslateY = Math.max(minTranslateY, Math.min(maxTranslateY, currentTranslateY));
        
        container.style.transform = `translate(-50%, ${currentTranslateY}px)`;
        container.style.webkitTransform = `translate(-50%, ${currentTranslateY}px)`;
        
        e.preventDefault();
    }
    
    function handleDragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        container.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.cursor = '';
        
        // 스냅 효과: 일정 거리 이상 올라갔으면 위로, 아니면 아래로
        const threshold = -100;
        const minTranslateY = -(window.innerHeight * 0.7);
        
        if (currentTranslateY < threshold) {
            // 위로 스냅
            const snapY = minTranslateY;
            container.style.transform = `translate(-50%, ${snapY}px)`;
            container.style.webkitTransform = `translate(-50%, ${snapY}px)`;
        } else {
            // 아래로 스냅 (원래 위치)
            container.style.transform = 'translate(-50%, 0)';
            container.style.webkitTransform = 'translate(-50%, 0)';
        }
        
        e.preventDefault();
    }
    
    // 스크롤 방지 (드래그 중)
    let touchStartY = 0;
    container.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        
        // 헤더 영역에서 드래그할 때만 스크롤 방지
        const header = document.querySelector('header');
        const touchTarget = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        
        if (header && (header.contains(touchTarget) || touchTarget === header)) {
            e.preventDefault();
        }
    }, { passive: false });
}

