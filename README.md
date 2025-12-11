# 카드 뒤집기 게임 🎮

가장 간단한 웹 기술(HTML, CSS, JavaScript)로 만든 메모리 카드 게임입니다.

## 기능

- 🎴 8쌍의 카드를 뒤집어서 매칭하는 메모리 게임
- ⏱️ 실시간 타이머 및 시도 횟수 표시
- 🏆 Supabase를 이용한 점수 저장 및 리더보드
- 🎨 아름다운 카드 뒤집기 애니메이션
- 📱 반응형 디자인 (모바일/데스크톱 지원)

## 시작하기

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. 프로젝트 대시보드에서 **Settings > API**로 이동하여 다음 정보를 확인하세요:
   - Project URL
   - anon/public key

### 2. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 SQL을 실행하여 `game_scores` 테이블을 생성하세요:

```sql
-- game_scores 테이블 생성
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT,
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  moves INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score);
CREATE INDEX IF NOT EXISTS idx_game_scores_time ON game_scores(time_seconds);

-- Row Level Security (RLS) 활성화
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Anyone can read scores" ON game_scores
  FOR SELECT USING (true);

-- 모든 사용자가 점수를 저장할 수 있도록 정책 설정
CREATE POLICY "Anyone can insert scores" ON game_scores
  FOR INSERT WITH CHECK (true);
```

### 3. Supabase 설정 파일 생성

**보안을 위해 실제 키는 숨김 폴더에 저장되고 버전 관리에서 제외됩니다.**

1. `.config` 폴더를 생성하세요 (이미 존재할 수 있습니다):
   ```bash
   mkdir -p .config
   ```

2. `supabase-config.example.js` 파일을 복사하여 `.config/supabase-config.js`를 생성하세요:
   ```bash
   cp supabase-config.example.js .config/supabase-config.js
   ```

3. `.config/supabase-config.js` 파일을 열고 다음 값을 본인의 Supabase 프로젝트 정보로 변경하세요:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

**중요**: 
- `.config` 폴더는 `.gitignore`에 추가되어 있어 Git에 커밋되지 않습니다.
- 실제 키를 절대 공개 저장소나 공개 채널에 업로드하지 마세요!
- 숨김 폴더(`.config`)에 저장되어 있어 실수로 노출될 위험이 줄어듭니다.

### 4. 게임 실행

로컬 서버를 실행하거나 브라우저에서 `index.html` 파일을 직접 열어주세요.

#### 로컬 서버 실행 (권장)

Python이 설치되어 있다면:
```bash
python -m http.server 8000
```

Node.js가 설치되어 있다면:
```bash
npx http-server
```

그 다음 브라우저에서 `http://localhost:8000`으로 접속하세요.

## 게임 방법

1. 카드를 클릭하여 뒤집습니다.
2. 같은 이모지의 카드 쌍을 찾아 매칭합니다.
3. 모든 카드를 매칭하면 게임이 완료됩니다.
4. 게임 완료 후 이름을 입력하고 점수를 저장할 수 있습니다.
5. 리더보드 버튼을 클릭하여 최고 점수를 확인할 수 있습니다.

## 점수 계산

- **시도 횟수**: 카드를 뒤집은 횟수 (낮을수록 좋음)
- **소요 시간**: 게임 완료까지 걸린 시간 (짧을수록 좋음)

리더보드는 시도 횟수를 우선으로 정렬하고, 동일한 경우 시간을 기준으로 정렬합니다.

## 기술 스택

- HTML5
- CSS3 (애니메이션, 그리드 레이아웃)
- Vanilla JavaScript (ES6+)
- Supabase (데이터베이스)

## 파일 구조

```
MCP_test/
├── index.html                  # 메인 HTML 파일
├── style.css                   # 스타일시트
├── script.js                    # 게임 로직
├── supabase-config.example.js   # Supabase 설정 예시 파일
├── .config/                     # 숨김 폴더 (Supabase 설정 저장)
│   ├── .gitkeep                 # Git 폴더 유지용
│   └── supabase-config.js       # Supabase 설정 (실제 키, .gitignore에 포함)
├── .gitignore                   # Git 제외 파일 목록
└── README.md                    # 프로젝트 설명서
```

## 보안 주의사항

⚠️ **중요**: 
- `.config/supabase-config.js` 파일에는 실제 Supabase 키가 포함되어 있습니다.
- `.config` 폴더 전체가 `.gitignore`에 추가되어 있어 Git에 커밋되지 않습니다.
- 숨김 폴더(`.config`)에 저장되어 있어 실수로 노출될 위험이 줄어듭니다.
- 실제 키를 절대 공개 저장소나 공개 채널에 공유하지 마세요.
- 프로젝트를 클론한 후 반드시 `supabase-config.example.js`를 참고하여 `.config/supabase-config.js`를 생성하세요.

## 라이선스

이 프로젝트는 자유롭게 사용할 수 있습니다.

