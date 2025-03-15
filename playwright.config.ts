import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e', // E2E 테스트 파일이 위치한 디렉터리
  timeout: 30 * 1000, // 각 테스트의 타임아웃 (30초)
  expect: {
    timeout: 5000, // `expect` 명령의 타임아웃 (5초)
  },
  fullyParallel: true, // 테스트를 병렬로 실행
  retries: 1, // 실패한 테스트를 한 번 재시도
  reporter: [['html', { open: 'never' }]], // HTML 리포트 생성
  use: {
    baseURL: 'http://localhost:3000', // 테스트할 애플리케이션의 기본 URL
    trace: 'on-first-retry', // 첫 번째 실패 시 트레이스 생성
    screenshot: 'only-on-failure', // 실패 시 스크린샷 저장
    video: 'retain-on-failure', // 실패 시 비디오 저장
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] }, // 데스크톱 크롬 브라우저
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] }, // 데스크톱 파이어폭스 브라우저
    },
    {
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] }, // 데스크톱 사파리 브라우저
    },
  ],
  webServer: {
    command: 'npm run dev', // 애플리케이션 서버 실행 명령어
    port: 3000, // 서버가 실행될 포트
    reuseExistingServer: !process.env.CI, // CI 환경에서는 서버를 재사용하지 않음
  },
});