export class MockLocalStorage {
  private mockLocalStorage = {};

  public getItem(key: string): string {
    return key in this.mockLocalStorage ? this.mockLocalStorage[key] : null;
  }

  public setItem(key: string, value: string) {
    this.mockLocalStorage[key] = value;
  }

  public removeItem(key: string) {
    delete this.mockLocalStorage[key];
  }

  public clear() {
    this.mockLocalStorage = {};
  }
}
