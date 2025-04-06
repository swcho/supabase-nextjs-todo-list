import { test, expect } from "@playwright/test";
import { cleanUp } from "../node-test-utils";
import { createTeam, login } from "../e2e-test-utils";
import { TEST_USER_01, TEST_USER_02 } from "../fixtures";
import { TID_ACCEPT_INVITATION, TID_CHECK_INVITATION, TID_INVITE_USER } from "../test-id-list";

test.describe("Team Invitations", () => {
  test("Clean up", async () => {
    await cleanUp();
  });

  test("Invite, accept, and verify team member", async ({ page }) => {
    await cleanUp();
    await login(page, TEST_USER_01);
    await createTeam(page, "test-team");

    await page.getByRole("textbox", { name: "make coffee" }).fill("장보기");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("장보기")).toBeVisible();

    await page.getByRole("textbox", { name: "make coffee" }).fill("운동");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("운동")).toBeVisible();

    await page.getByTestId('settings').click();
    await page.getByRole('button', { name: 'Invite User' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('test_user_02@todo.ex');
    await page.getByRole('textbox', { name: 'Email address' }).press('Escape');

    await page.getByRole("button", { name: "Invite user" }).click();
    await page.getByRole("textbox", { name: "Email address" }).click();

    await page
      .getByRole("textbox", { name: "Email address" })
      .fill(TEST_USER_02.email);
    await page.getByTestId(TID_INVITE_USER).click();
    await page.getByRole("button").filter({ hasText: /^$/ }).click();
    // 클립보드에서 텍스트 읽기
    const invitationUrlStr = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    // console.log("Clipboard content:", invitationUrlStr);
    const invitationUrl = new URL(invitationUrlStr);
    
    const targetUrl = invitationUrl.pathname + invitationUrl.search;
    
    await page.getByRole("button", { name: "Close" }).click();
    await page.getByRole("button", { name: "t", exact: true }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    
    await expect(page.getByText('Login')).toBeVisible();

    // 로그인 하지 않은 사용자가 초대 링크를 클릭했을 때
    await page.goto(targetUrl);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await login(page, TEST_USER_02);
    await page.getByTestId(TID_CHECK_INVITATION).click();
    await page.getByTestId(TID_ACCEPT_INVITATION).click();
    // console.log("test finished")

    // 로그인 한 사용자가 초대 링크를 클릭했을 때
  });
});
