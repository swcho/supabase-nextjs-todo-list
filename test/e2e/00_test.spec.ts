import { test, expect } from '@playwright/test';
import { TEST_USER_01 } from '../fixtures';

test.describe('Test', () => {
  test('naver', async ({ page }) => {
    await page.goto('https://www.naver.com');
    
  });
});
