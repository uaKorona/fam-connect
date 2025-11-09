import { Injectable } from '@angular/core';
import { HostingProvider, HostingConfig } from './hosting-provider.interface';

/**
 * Локальний hosting provider для розробки
 * Не виконує keep-alive операцій, оскільки локальний сервер не засинає
 */
@Injectable({
  providedIn: 'root',
})
export class LocalHostingService implements HostingProvider {
  private config: HostingConfig | null = null;
  private readonly providerName = 'local';

  initialize(config: HostingConfig): void {
    this.config = config;
    console.log(`[${this.providerName}] Ініціалізовано для локальної розробки`);
  }

  startKeepAlive(): void {
    console.log(
      `[${this.providerName}] Keep-alive не потрібен для локальної розробки`
    );
  }

  stopKeepAlive(): void {
    console.log(`[${this.providerName}] Keep-alive не активний`);
  }

  isKeepAliveActive(): boolean {
    return false;
  }

  getProviderName(): string {
    return this.providerName;
  }
}
