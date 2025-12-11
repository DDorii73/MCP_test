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
        
        // 모바일 터치 이벤트 최적화 (스크롤과 충돌 방지)
        let touchStartTime = 0;
        let touchStartY = 0;
        
        cardElement.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        cardElement.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchEndY = e.changedTouches[0].clientY;
            const timeDiff = touchEndTime - touchStartTime;
            const yDiff = Math.abs(touchEndY - touchStartY);
            
            // 빠른 탭이고 수직 이동이 적으면 클릭으로 처리
            if (timeDiff < 300 && yDiff < 10) {
                e.preventDefault();
                handleCardClick(index);
            }
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
    // window 객체에서 먼저 확인
    if (typeof window !== 'undefined' && window.supabaseClient) {
        supabaseClient = window.supabaseClient;
        return true;
    }
    
    // 전역 supabaseClient 확인
    if (typeof supabaseClient !== 'undefined' && supabaseClient !== null) {
        return true;
    }
    
    // initSupabase 함수 호출 시도
    if (typeof initSupabase === 'function') {
        const result = initSupabase();
        if (result && (typeof window !== 'undefined' ? window.supabaseClient : supabaseClient)) {
            return true;
        }
    }
    
    // 직접 초기화 시도 (최후의 수단)
    if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined') {
        try {
            // 전역 변수에서 URL과 KEY 가져오기 시도
            const url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : null;
            const key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : null;
            
            if (url && key && url !== 'YOUR_SUPABASE_URL' && key !== 'YOUR_SUPABASE_ANON_KEY') {
                supabaseClient = window.supabase.createClient(url, key);
                window.supabaseClient = supabaseClient;
                console.log('✅ Supabase 클라이언트가 직접 초기화되었습니다.');
                return true;
            }
        } catch (error) {
            console.error('❌ Supabase 직접 초기화 실패:', error);
        }
    }
    
    return false;
}

// 점수 저장
async function saveScore() {
    const saveBtn = document.getElementById('save-score-btn');
    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput.value.trim() || '익명';
    
    // 게임이 시작되지 않았거나 완료되지 않은 경우
    if (startTime === null) {
        alert('게임을 완료한 후 점수를 저장할 수 있습니다.');
        return;
    }
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    // 버튼 비활성화 및 로딩 표시
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';
    
    // Supabase 초기화 확인
    console.log('점수 저장 시작 - Supabase 클라이언트 확인:', {
        supabaseClient: typeof supabaseClient !== 'undefined' ? '존재' : '없음',
        windowSupabase: typeof window !== 'undefined' && typeof window.supabase !== 'undefined' ? '존재' : '없음',
        SUPABASE_URL: typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '없음'
    });
    
    if (!ensureSupabaseInit()) {
        console.error('Supabase 초기화 실패 - 현재 상태:', {
            supabaseClient,
            windowSupabaseClient: typeof window !== 'undefined' ? window.supabaseClient : '없음',
            initSupabase: typeof initSupabase
        });
        alert('Supabase가 설정되지 않았습니다.\n브라우저 콘솔(F12)을 확인해주세요.');
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        return;
    }
    
    console.log('Supabase 클라이언트 확인됨:', supabaseClient);
    
    try {
        const matchedPairsCount = matchedPairs.length / 2; // 매칭된 쌍의 수
        const totalPairsCount = 8; // 전체 쌍의 수
        
        const scoreData = {
            player_name: playerName,
            score: moves,
            time_seconds: elapsed,
            moves: moves,
            matched_pairs: matchedPairsCount,
            total_pairs: totalPairsCount
        };
        
        console.log('점수 저장 시도:', scoreData);
        console.log('Supabase 클라이언트:', supabaseClient);
        console.log('테이블 이름: card_game_scores');
        
        const { data, error } = await supabaseClient
            .from('card_game_scores')
            .insert([scoreData])
            .select();
        
        console.log('Supabase 응답:', { data, error });
        
        if (error) {
            console.error('점수 저장 오류 상세:', {
                error,
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert('점수 저장에 실패했습니다.\n오류: ' + error.message + '\n\n브라우저 콘솔(F12)에서 자세한 정보를 확인하세요.');
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        } else {
            console.log('✅ 점수 저장 성공:', data);
            // 성공 메시지 표시
            saveBtn.textContent = '✅ 저장 완료!';
            saveBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
            
            // 입력 필드 초기화
            playerNameInput.value = '';
            
            // 2초 후 모달 닫기 및 새 게임 시작
            setTimeout(() => {
                document.getElementById('game-complete-modal').classList.remove('show');
                initGame();
                // 버튼 상태 초기화
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }
    } catch (error) {
        console.error('점수 저장 예외 발생:', error);
        console.error('스택 트레이스:', error.stack);
        alert('점수 저장 중 오류가 발생했습니다.\n오류: ' + (error.message || '알 수 없는 오류') + '\n\n브라우저 콘솔(F12)에서 자세한 정보를 확인하세요.');
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
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
});

