import { test, expect } from '@playwright/test'

test('should inform user to add a vehicle and replace with content upon selection', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByText('you must add at least one vehicle')
  ).toBeVisible()
  await page.getByTestId('dropdown-option-0').click()
  await expect(page.getByTestId('vehicle-dashboard')).toBeVisible()
  await expect(page.getByText('you must add at least one vehicle')).toBeHidden()
})

test('should allow the user to login', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('login')).toBeVisible()
  await page.getByTestId('login').click()
  await expect(page.getByText('Forgot password')).toBeVisible()
})
