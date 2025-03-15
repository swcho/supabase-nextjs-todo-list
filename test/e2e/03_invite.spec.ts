import { test, expect } from '@playwright/test';

test.describe('Team Invitations', () => {
  test('Invite, accept, and verify team member', async ({ page }) => {
    // 로그인 (User 1)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test_user_01@todo.ex');
    await page.fill('input[name="password"]', '111111');
    await page.click('button[type="submit"]');

    // 팀 생성 및 초대
    await page.goto('/teams');
    await page.click('button#create-team');
    await page.fill('input[name="team-name"]', 'Invite Test Team');
    await page.click('button#submit-team');
    await page.click(`button[data-testid="invite-member"]`);
    await page.fill('input[name="invite-email"]', 'test_user_02@todo.ex');
    await page.click('button#send-invite');
    await expect(page.locator('text=Invitation sent')).toBeVisible();

    // 초대 수락 (User 2)
    await page.goto('/logout');
    await page.fill('input[name="email"]', 'test_user_02@todo.ex');
    await page.fill('input[name="password"]', '111111');
    await page.click('button[type="submit"]');
    await page.goto('/invitations');
    await page.click('button#accept-invite');
    await expect(page.locator('text=Invite Test Team')).toBeVisible();

    // 구성원 확인
    await page.goto('/teams');
    await expect(page.locator('text=Invite Test Team')).toBeVisible();

    // Todo 생성
    await page.goto('/todos');
    await page.fill('input[name="todo-task"]', 'Team Member Todo');
    await page.click('button#add-todo');
    await expect(page.locator('text=Team Member Todo')).toBeVisible();
  });
});