import { test, expect } from '@playwright/test';

test.describe('Todo Management', () => {
  test('Create, complete, and delete a todo', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test_user_01@todo.ex');
    await page.fill('input[name="password"]', '111111');
    await page.click('button[type="submit"]');

    // Todo 생성
    await page.goto('/todos');
    await page.fill('input[name="todo-task"]', 'Test Todo');
    await page.click('button#add-todo');
    await expect(page.locator('text=Test Todo')).toBeVisible();

    // Todo 완료
    await page.click(`button[data-testid="complete-todo-Test Todo"]`);
    await expect(page.locator(`text=Test Todo`).locator('css=[data-completed="true"]')).toBeVisible();

    // Todo 삭제
    await page.click(`button[data-testid="delete-todo-Test Todo"]`);
    await expect(page.locator('text=Test Todo')).not.toBeVisible();
  });
});