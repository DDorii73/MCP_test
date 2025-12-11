// Supabase 설정 예시 파일
// 이 파일을 복사하여 supabase-config.js로 이름을 변경하고 실제 값을 입력하세요.
// supabase-config.js는 .gitignore에 추가되어 버전 관리에서 제외됩니다.

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 예: 'https://xxxxxxxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 예: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Supabase 클라이언트 초기화
let supabaseClient = null;

// Supabase 초기화 함수
function initSupabase() {
    // window.supabase 또는 전역 supabase 객체 확인
    const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
    
    if (supabaseLib && SUPABASE_URL && SUPABASE_ANON_KEY && 
        SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase 클라이언트가 초기화되었습니다.');
            return true;
        } catch (error) {
            console.error('❌ Supabase 클라이언트 초기화 오류:', error);
            return false;
        }
    } else {
        console.warn('⚠️ Supabase 라이브러리를 찾을 수 없습니다. 스크립트 로드 순서를 확인하세요.');
        return false;
    }
}

// 즉시 초기화 시도 (스크립트가 순서대로 로드되었다면 작동함)
if (!initSupabase()) {
    // 실패한 경우 약간의 지연 후 재시도
    setTimeout(() => {
        if (!initSupabase()) {
            // 여전히 실패하면 window.onload에서 재시도
            window.addEventListener('load', () => {
                initSupabase();
            });
        }
    }, 100);
}

