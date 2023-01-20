import { test, expect } from '@playwright/test'

const mockDeploymentResponse = {
  result: {
    deploymentId: 3000387,
    vehicleName: 'daphne',
    name: 'Daphne 113 MBTS',
    path: '2022-04-11',
    startEvent: { unixTime: 1652734292758, state: 1, eventId: 16791081 },
    launchEvent: {
      unixTime: 1652807507838,
      eventId: 16797918,
      note: 'Vehicle in water',
    },
    recoverEvent: {
      unixTime: 1652971736577,
      eventId: 16808573,
      note: 'Vehicle recovered',
    },
    endEvent: { unixTime: 1652975381457, state: 0, eventId: 16808931 },
  },
}

const mockVehicleResponse = {
  result: [
    { vehicleName: 'daphne', color: '#CC33FF' },
    { vehicleName: 'brizo', color: '#f4ba0c' },
    { vehicleName: '', color: '#FF9900' },
  ],
}

test('should inform user to add a vehicle and replace with content upon selection', async ({
  page,
}) => {
  await page.route('**/info/vehicles*', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify(mockVehicleResponse),
    })
  )
  await page.route('**/deployments/last*', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify(mockDeploymentResponse),
    })
  )
  await page.route('**/info?', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({}),
    })
  )
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
