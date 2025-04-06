import { test, expect } from "@playwright/test";
import { cleanUp } from "../node-test-utils";
import { TEST_USER_01 } from "../fixtures";
import {
  TID_CREATE_TEAM_BUTTON,
  TID_TEAM_NAME,
  TID_TEAM_SUBMIT,
  TID_TEAM_TITLE,
  TID_TEAM_URL_KEY,
} from "../test-id-list";

test.describe("Todo Management", () => {
  test("Clean up", async () => {
    await cleanUp();
  });

  test("Create, complete, and delete a todo", async ({ page }) => {
    // 로그인
    await page.goto("/");
    await page.getByPlaceholder("Your email address").fill(TEST_USER_01.email);
    await page.getByPlaceholder("Your password").fill(TEST_USER_01.password);
    await page.getByText("Sign in", { exact: true }).click();

    // 팀 생성
    await page.getByTestId(TID_CREATE_TEAM_BUTTON).click();
    await page.getByTestId(TID_TEAM_NAME).fill("Test Team");
    await page.getByTestId(TID_TEAM_URL_KEY).fill("test-team");
    await page.getByTestId(TID_TEAM_SUBMIT).click();
    await expect(page.getByTestId(TID_TEAM_TITLE)).toHaveText("Test Team");

    await page.goto("/teams/test-team");

    await page.getByRole("textbox", { name: "make coffee" }).fill("장보기");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("장보기")).toBeVisible();

    await page.getByRole("textbox", { name: "make coffee" }).fill("운동");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("운동")).toBeVisible();

    await page
      .getByRole("listitem")
      .filter({ hasText: "장보기" })
      .getByRole("checkbox")
      .click();
    await expect(
      page
        .getByRole("listitem")
        .filter({ hasText: "장보기" })
        .getByRole("checkbox")
    ).toBeChecked();
    await page
      .getByRole("listitem")
      .filter({ hasText: "장보기" })
      .getByRole("button")
      .click();
    await expect(page.getByText("장보기")).not.toBeVisible();
    await page
      .getByRole("listitem")
      .filter({ hasText: "운동" })
      .getByRole("button")
      .click();
    await expect(page.getByText("운동")).not.toBeVisible();
    // console.log("test finished");
  });
});
