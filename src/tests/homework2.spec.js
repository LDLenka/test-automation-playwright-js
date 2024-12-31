import { test, expect } from '@playwright/test';

async function vyplnFormularPrihlaseni(page) {
  const ico = '04238907';
  const odberatel = 'Unie rodičů při ZŠ a MŠ Weberova, Praha 5, z.s.';
  const adresa = 'Weberova 1090/1, Košíře, 15000 Praha 5';
  const zastoupena = 'Mgr.Jana Volná';
  const jmeno = 'Jana Volná';
  const telefon = '789987898';
  const email = `jana.volna@gmail.com`;
  const pocetDeti = '50'
  const vek = '5-15'
  const doprovod = '5'

  let today = new Date()

  let firstDate = new Date();
  firstDate.setDate(today.getDate() + 7);

  let lastDate = new Date();
  lastDate.setDate(today.getDate() + 14);

  await page.getByLabel('IČO').fill(ico);
  //pridan wait pro cekani na chybu ARES
  await page.getByLabel('Odběratel').click();
  await page.waitForTimeout(5000);
  await page.getByLabel('Odběratel').fill(odberatel);
  await page.getByLabel('Úplná adresa').fill(adresa);
  await page.getByLabel('Zastoupena - ředitel(ka) školy').fill(zastoupena);
  await page.getByLabel('Jméno a příjmení').fill(jmeno);
  await page.getByLabel('Telefon').fill(telefon);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Upřednostňovaný termín 1').fill(firstDate.toLocaleDateString());
  await page.locator('#end_date_1').fill(lastDate.toLocaleDateString());

  await page.getByRole('tab', { name: 'Příměstský tábor' }).click();
  await page.getByRole('spinbutton', { name: 'Počet dětí' }).fill(pocetDeti);
  await page.getByRole('textbox', { name: 've věku' }).fill(vek);
  await page.getByRole('spinbutton', { name: 'Počet pedagogického doprovodu' }).fill(doprovod);
}

test.describe('Test navigace do formulare objednavky', () => {
  test.beforeEach(async ({ page }) => {

    test('vytvoreni nove objednavky', async () => {
      await page.goto('https://team8-2022brno.herokuapp.com/');
      await expect(page.getByRole('button', { name: 'Pro učitelé' })).toBeVisible();
      await page.getByRole('button', { name: 'Pro učitelé' }).click();
      await expect(page.getByRole('link', { name: 'Objednávka pro MŠ/ZŠ' })).toBeVisible();
      await page.getByRole('link', { name: 'Objednávka pro MŠ/ZŠ' }).click();
      await expect(page.getByRole('heading', { name: 'Nová objednávka' })).toBeVisible();
    });

    test('kontrola spravneho zobrazeni formulare objednavky', async () => {
      await expect(page.getByLabel('IČO')).toBeVisible();
      await expect(page.getByLabel('Odběratel')).toBeVisible();
      await expect(page.getByText('Úplná adresa')).toBeVisible();
      await expect(page.getByLabel('Zastoupena - ředitel(ka) školy')).toBeVisible();
      await expect(page.getByLabel('Jméno a příjmení')).toBeVisible();
      await expect(page.getByLabel('Telefon')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Upřednostňovaný termín 1')).toBeVisible();
      await expect(page.getByLabel('Upřednostňovaný termín 2 - nepovinné')).toBeVisible();
      await expect(page.getByLabel('Upřednostňovaný termín 3 - nepovinné')).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Příměstský tábor' })).toBeVisible();
      await page.getByRole('tab', { name: 'Příměstský tábor' }).click();
      await page.getByLabel('Kurz').selectOption('forenoon');
      await expect(page.getByRole('spinbutton', { name: 'Počet dětí' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 've věku' })).toBeVisible();
      await expect(page.getByRole('spinbutton', { name: 'Počet pedagogického doprovodu' })).toBeVisible();
    });
  });
});


test.describe('Vytvoreni objednavky', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://team8-2022brno.herokuapp.com/objednavka/pridat');
    await vyplnFormularPrihlaseni(page);
  });

  test('Vyplnění registračního formuláře', async ({ page }) => {
    await page.goto('/registrace');
    const fullname = 'Lenka Nová'
    console.log(fullname);
    await page.getByLabel('Jméno a příjmení').fill(fullname);
  });


  test('Odeslání vyplněné objednávky', async ({ page }) => {
    await page.getByRole('button', { name: 'Uložit objednávku' }).click();

    await expect(page.getByRole('heading', { name: 'Děkujeme za objednávku' })).toBeVisible();
    await expect(page.getByText('Objednávka byla úspěšně uložena a bude zpracována. O postupu vás budeme informovat. Zkontrolujte si také složku SPAM')).toBeVisible();
  });

  test('Odeslání chybně vyplněné objednávky', async ({ page }) => {
    await vyplnFormularPrihlaseni(page);
    await page.getByLabel('Odběratel').fill('');

    await page.getByRole('button', { name: 'Uložit objednávku' }).click();
    await expect(page.getByText('Objednávka byla úspěšně uložena a bude zpracována. O postupu vás budeme informovat. Zkontrolujte si také složku SPAM')).not.toBeVisible();
  });
});