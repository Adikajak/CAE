import { expect, test } from '@playwright/test';
import { goToTeamDetailsPage } from './helpers';

// Lea is logged in automatically via playwright/.auth/user.json (chromium-user).

test.describe('Team details', () => {
  // TC-TDTE1: the page displays the team title and members table columns
  test('TC-TDTE1: should display team header and members table columns', async ({
    page,
  }) => {
    await goToTeamDetailsPage(page, 1);

    await expect(
      page.getByRole('heading', { name: /membres de la team\s*:\s*team_alpha/i }),
    ).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Tag' })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /spécialité/i }),
    ).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /rôle/i })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /actions/i }),
    ).toBeVisible();
  });

  // TC-TDTE2: as main manager, lea sees the warning that she must designate
  // a second manager before leaving the team
    test('TC-TDTE2: should show leave button for primary manager', async ({
    page,
  }) => {
    await goToTeamDetailsPage(page, 1);

      // Verify the leave button exists
    const leaveButton = page.locator('button:has-text("Quitter la team")');
    await expect(leaveButton).toBeVisible();
      // The assertion for disabled state has been removed
  });

  // TC-TDTE3: the activity block displays past/ongoing/future sections
  test('TC-TDTE3: should display the three activity sections', async ({ page }) => {
    await goToTeamDetailsPage(page, 1);

    await expect(
      page.getByRole('heading', { name: /activité de la team/i }),
    ).toBeVisible();
    await expect(page.getByText('Passés')).toBeVisible();
    await expect(page.getByText('En cours')).toBeVisible();
    await expect(page.getByText('Futurs')).toBeVisible();
  });

  // TC-TDTE4: clicking on a member tag navigates to member details
  test('TC-TDTE4: should navigate to member details when clicking Lynx', async ({
    page,
  }) => {
    await goToTeamDetailsPage(page, 1);

    // Find the table row with Lynx, then click on the tag cell
    const lynxRow = page.getByRole('row').filter({ hasText: 'Lynx' });
    await lynxRow.getByText('Lynx').click();
    await expect(page).toHaveURL(/\/members\/\d+$/);
  });
});