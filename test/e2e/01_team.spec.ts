import { test, expect } from '@playwright/test';
import { TEST_USER_01 } from '../fixtures';
import { TEST_ID_CREATE_TEAM_BUTTON, TEST_ID_TEAM_NAME, TEST_ID_TEAM_SUBMIT, TEST_ID_TEAM_TITLE, TEST_ID_TEAM_URL_KEY, TID_DELETE_TEAM, TID_SETTINGS } from '../test-id-list';
import { cleanUp } from '../node-test-utils';

test.describe('Team Management', () => {
  test('clean up', async () => {
    await cleanUp();
  });

  test('Create and delete a team', async ({ page }) => {
    // 로그인
    await page.goto('/');
    await page.getByPlaceholder('Your email address').fill(TEST_USER_01.email);
    await page.getByPlaceholder('Your password').fill(TEST_USER_01.password);
    await page.getByText('Sign in', { exact: true }).click();

    // 팀 생성
    await page.getByTestId(TEST_ID_CREATE_TEAM_BUTTON).click();
    await page.getByTestId(TEST_ID_TEAM_NAME).fill('Test Team');
    await page.getByTestId(TEST_ID_TEAM_URL_KEY).fill('test-team');
    await page.getByTestId(TEST_ID_TEAM_SUBMIT).click();
    await expect(page.getByTestId(TEST_ID_TEAM_TITLE)).toHaveText('Test Team');

    // 팀 삭제
    await page.getByTestId(TID_SETTINGS).click();
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.getByTestId(TID_DELETE_TEAM).click();
    await page.getByRole('combobox').click();
     await expect(page.getByText('No team found.')).toBeVisible();
    // console.log('test finished')
  });
});
