-- 카드 뒤집기 게임용 Supabase 데이터베이스 마이그레이션
-- 이 파일을 Supabase SQL Editor에서 실행하세요.

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
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 삭제 (선택사항)
DROP POLICY IF EXISTS "Anyone can read scores" ON game_scores;
DROP POLICY IF EXISTS "Anyone can insert scores" ON game_scores;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Anyone can read scores" ON game_scores
  FOR SELECT USING (true);

-- 모든 사용자가 점수를 저장할 수 있도록 정책 설정
CREATE POLICY "Anyone can insert scores" ON game_scores
  FOR INSERT WITH CHECK (true);

-- 테이블 생성 확인
SELECT * FROM game_scores LIMIT 1;

