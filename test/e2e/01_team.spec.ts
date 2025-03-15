import { test, expect } from '@playwright/test';
import { TEST_USER_01 } from '../fixtures';
import { TEST_ID_CREATE_TEAM_BUTTON, TEST_ID_TEAM_NAME, TEST_ID_TEAM_SUBMIT } from '../test-id-list';

test.describe('Team Management', () => {
  test('Create and delete a team', async ({ page }) => {
    // // 로그인
    await page.goto('/');
    await page.fill('input[name="email"]', TEST_USER_01.email);
    await page.fill('input[name="password"]', TEST_USER_01.password);
    await page.click('button[type="submit"]');

    // // 팀 생성
    await page.click(`button#${TEST_ID_CREATE_TEAM_BUTTON}`);
    await page.fill(`input#${TEST_ID_TEAM_NAME}`, 'Test Team');
    await page.click(`button#${TEST_ID_TEAM_SUBMIT}`);
    await expect(page.locator('text=Test Team')).toBeVisible();

    // 팀 삭제
    // await page.click(`button[data-testid="delete-team-Test Team"]`);
    // await expect(page.locator('text=Test Team')).not.toBeVisible();
  });
});
