import { AppConfig } from '../../../src/environments/environment';
import { LoginPage } from '../../page-objects/login.po';

describe("CATcher's Login Page", () => {
  let page: LoginPage;

  beforeAll(() => {
    page = new LoginPage();
    page.navigateToRoot();
  });

  it('displays "CATcher" in header bar', async () => {
    expect(await page.getTitle()).toEqual(`CATcher v${AppConfig.version}\nreceipt`);
  });

  it('allows users to authenticate themselves', async () => {
    await page.login();
    expect(await page.getConfirmationScreenTitle()).toEqual('Confirm Login Account');
    await page.confirmUser();
  });
});
