import { expect, test } from '@playwright/test';
import { goToTournamentDetailsPage } from './helpers';

// These tests run without any stored session (chromium-public).

test.describe('Tournament details - unauthenticated', () => {
  // TC-TD6: unauthenticated user sees the tournament info but not the register button
  test('TC-TD6: should display tournament info without register button', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 3);
    await expect(page.getByText('Spring Showdown 2029')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /inscrire ma team/i }),
    ).not.toBeVisible();
  });

  // TC-TD10: navigating to a non-existent tournament shows an error alert
  test('TC-TD10: should show error alert for a non-existent tournament', async ({
    page,
  }) => {
    await page.goto('/tournaments/99999');
    await expect(
      page.getByText(/ce tournoi n'est pas encore publié ou n'existe pas/i),
    ).toBeVisible();
  });
});
