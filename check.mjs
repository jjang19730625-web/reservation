import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

const dir = './screenshots';
if (!existsSync(dir)) mkdirSync(dir);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

// 1. 초기 화면 (API 키 모달)
await page.goto('http://localhost:3000');
await page.waitForTimeout(1500);
await page.screenshot({ path: './screenshots/01-api-modal.png', fullPage: true });
console.log('✓ 01-api-modal.png');

// 2. API 키 입력
const keyInput = await page.$('input[type="password"]');
if (keyInput) {
  // Read key from localStorage is not available yet, just use a placeholder to check UI
  await keyInput.fill('sk-or-v1-test-placeholder-key-for-ui-check');
  await page.screenshot({ path: './screenshots/02-key-entered.png', fullPage: true });
  console.log('✓ 02-key-entered.png');

  // 시작하기 버튼 클릭
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/03-main-ui.png', fullPage: true });
  console.log('✓ 03-main-ui.png');

  // 3. 채팅 입력 테스트
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.fill('안녕하세요, 배가 아파서 예약하고 싶어요');
    await page.screenshot({ path: './screenshots/04-chat-input.png', fullPage: true });
    console.log('✓ 04-chat-input.png');
  }
}

await browser.close();
console.log('\n모든 스크린샷 완료');
