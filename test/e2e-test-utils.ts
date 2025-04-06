import { Page } from "playwright/test";
import { TID_CREATE_TEAM_BUTTON, TID_TEAM_NAME, TID_TEAM_SUBMIT, TID_TEAM_URL_KEY } from "./test-id-list";

export async function login(
  page: Page,
  user: { email: string; password: string }
) {
  await page.goto("/");
  await page.getByPlaceholder("Your email address").fill(user.email);
  await page.getByPlaceholder("Your password").fill(user.password);
  await page.getByText("Sign in", { exact: true }).click();
}

export async function createTeam(page: Page, urlKey: string) {
  await page.getByTestId(TID_CREATE_TEAM_BUTTON).click();
  await page.getByTestId(TID_TEAM_NAME).fill(urlKey);
  await page.getByTestId(TID_TEAM_URL_KEY).fill(urlKey);
  await page.getByTestId(TID_TEAM_SUBMIT).click();
}
