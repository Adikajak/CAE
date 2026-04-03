import { expect, test } from '@playwright/test';
import { goToTournamentDetailsPage } from './helpers';

// Lea is logged in automatically via playwright/.auth/user.json (chromium-user).

test.describe('Tournament details', () => {
  // TC-TD1: the page displays the tournament name, description, state chip,
  // dates and the team count
  test('TC-TD1: should display tournament info after loading', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 6);
    await expect(page.getByText('Vinci Easter Cup 2026')).toBeVisible();
    await expect(page.getByRole('heading', { name: /teams inscrites/i })).toBeVisible();
  });

  // TC-TD2: teams are listed for a tournament with registrations
  test('TC-TD2: should show registered teams', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 6);
    await expect(
      page.getByRole('columnheader', { name: /nom de la team/i }),
    ).toBeVisible();
  });

  // TC-TD3: the "Inscrire ma team" button is visible for lea on a PLANIFIED tournament
  test('TC-TD3: should show register button for lea on a PLANIFIED tournament', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 6);
    await expect(
      page.getByRole('button', { name: /inscrire ma team/i }),
    ).toBeVisible();
  });

  // TC-TD7: lea clicks "Inscrire ma team" → error because TEAM_ALPHA only has
  // 3 members (lea + tom + ines) and the minimum required is 4
  test('TC-TD7: should show error when team has less than 4 members', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 6);
    await page.getByRole('button', { name: /inscrire ma team/i }).click();
    await expect(
      page.getByText(/votre team doit avoir au moins 4 membres/i),
    ).toBeVisible();
  });

  // TC-TD8: the ONGOING tournament does not show the register button for lea
  test('TC-TD8: should not show register button for an ONGOING tournament', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 5);
    await expect(
      page.getByRole('button', { name: /inscrire ma team/i }),
    ).not.toBeVisible();
  });

  // TC-TD9: the FINISHED tournament does not show the register button for lea
  test('TC-TD9: should not show register button for a FINISHED tournament', async ({
    page,
  }) => {
    await goToTournamentDetailsPage(page, 1);
    await expect(
      page.getByRole('button', { name: /inscrire ma team/i }),
    ).not.toBeVisible();
  });
});
