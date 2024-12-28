import { test, expect } from '@playwright/test';
const { v4: uuidv4 } = require('uuid');


function getUniqueEmail() {
  const guid = uuidv4();
  const email = `lenka.nova${guid}@gmail123.com`;
  return email
}

test('1 formular registrace', async ({ page }) => {
  await test.step('navigace do formulare registrace', async () => {
    await page.goto('/prihlaseni');
    await page.getByRole('link', { name: 'Zaregistrujte se' }).click();
    await page.locator('.col-md-10').click();
    await page.locator('form div').filter({ hasText: 'Zaregistrovat' }).nth(1).click();
  });

  await test.step('kontrola spravneho zobrazeni', async () => {
    await test.step('overeni zobrazeni vstupních poli', async () => {
      await expect(page.getByLabel('Jméno a příjmení')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Heslo')).toBeVisible()
      await expect(page.getByLabel('Kontrola hesla')).toBeVisible()
    });

    await test.step('kontrola zobrazeni oproti screenshotu', async () => {
      await page.setViewportSize({ width: 800, height: 600 });
      await page.screenshot({ path: "login_page_800_600.png" });

      await expect(page).toHaveScreenshot({ path: "login_page_800_600.png" });
    });
  });
});

test('2 validni registrace uzivatele ', async ({ page }) => {
  const email = getUniqueEmail();
  const fullname = 'Lenka Nová';
  const password = 'Lenka123';

  await test.step('registrace uzivatele', async () => {
    await page.goto('/registrace');
    await page.getByLabel('Jméno a příjmení').fill(fullname);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Heslo').fill(password);
    await page.getByLabel('Kontrola hesla').fill(password);
    await page.getByRole('button', { name: 'Zaregistrovat' }).click();
  });

  await test.step('kontrola uspesne registrace', async () => {
    await expect(page.locator('#navbarSupportedContent')).toContainText(fullname);
    await page.getByText('Přihlášen').click();
    await expect(page.getByText('Přihlášen')).toBeVisible();
    await expect(page.locator('#navbarSupportedContent .navbar-right div.nav-item')).toContainText('Přihlášen');
    await expect(page.locator(`#navbarSupportedContent a[title="${fullname}"]`)).toContainText(fullname);
  });
});

test.describe('test registracniho formulare', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registrace');
    const fullname = 'Lenka Nová'

    await page.getByLabel('Jméno a příjmení').fill(fullname);
  });

  test('3 registrace uzivatele s existujicim mailem', async ({ page }) => {

    const existingEmail = `existujicimail@gmail123.com`;
    const password = 'LenkaNova123'

    await page.getByLabel('Email').fill(existingEmail);
    await page.getByLabel('Heslo').fill(password);
    await page.getByLabel('Kontrola hesla').fill(password);
    await page.getByRole('button', { name: 'Zaregistrovat' }).click();

    await test.step('kongtrola stavu formulare', async () => {
      const emailErrorMessage = page.locator('form span.invalid-feedback');
      const count = await emailErrorMessage.count();

      await expect(count).toBe(1);
      await expect(emailErrorMessage).toContainText('Účet s tímto emailem již existuje');
    });

    await test.step('kontrola ze registrace neprobehla', async () => {
      const elementLoggedIn = page.locator('div.nav-item span', { hasText: 'Přihlášen' });
      await expect(elementLoggedIn).toHaveCount(0);
    });
  });


  test('4 registrace uzivatele s nevalidnim heslem (obsahujici pouze cisla)', async ({ page }) => {

    const email = getUniqueEmail();
    const password = '1234567890123';

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Heslo').fill(password);
    await page.getByLabel('Kontrola hesla').fill(password);
    await page.getByRole('button', { name: 'Zaregistrovat' }).click();

    await test.step('kongtrola stavu formulare', async () => {
      const passwordErrorMessage = page.locator('form span.invalid-feedback');
      const count = await passwordErrorMessage.count();

      await expect(count).toBe(1);
      await expect(passwordErrorMessage).toContainText('Heslo musí obsahovat minimálně 6 znaků, velké i malé písmeno a číslici');
    });

    await test.step('kontrola ze registrace neprobehla', async () => {
      const elementLoggedIn = page.locator('div.nav-item span', { hasText: 'Přihlášen' });
      await expect(elementLoggedIn).toHaveCount(0);
    });
  });
});

