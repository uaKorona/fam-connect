import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HostingProvider, HostingConfig } from './hosting-provider.interface';

/**
 * Render-специфічний hosting provider
 * Реалізує keep-alive механізм для запобігання засинанню сервера
 */
@Injectable({
  providedIn: 'root',
})
export class RenderHostingService implements HostingProvider {
  private keepAliveInterval: any = null;
  private config: HostingConfig | null = null;
  private readonly providerName = 'render';

  constructor(private http: HttpClient) {}

  initialize(config: HostingConfig): void {
    this.config = config;
    console.log(
      `[${this.providerName}] Ініціалізовано з конфігурацією:`,
      config
    );
  }

  startKeepAlive(): void {
    if (!this.config?.enabled) {
      console.log(`[${this.providerName}] Keep-alive вимкнений в конфігурації`);
      return;
    }

    if (this.keepAliveInterval) {
      console.log(`[${this.providerName}] Keep-alive вже активний`);
      return;
    }

    const interval = this.config.interval || 12 * 60 * 1000; // 12 хвилин за замовчуванням

    console.log(
      `[${this.providerName}] Запуск keep-alive з інтервалом ${
        interval / 1000 / 60
      } хвилин`
    );

    this.keepAliveInterval = setInterval(() => {
      this.pingServer();
    }, interval);

    // Перший ping одразу
    this.pingServer();
  }

  stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      console.log(`[${this.providerName}] Keep-alive зупинено`);
    }
  }

  isKeepAliveActive(): boolean {
    return this.keepAliveInterval !== null;
  }

  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Відправляє ping запит до сервера для підтримки активності
   */
  private pingServer(): void {
    if (!this.config) {
      console.warn(`[${this.providerName}] Конфігурація не ініціалізована`);
      return;
    }

    const pingUrl = this.getPingUrl();

    this.http
      .get(pingUrl, {
        headers: { 'X-Keep-Alive': 'true' },
      })
      .subscribe({
        next: () => {
          console.log(`[${this.providerName}] Keep-alive ping успішний`);
        },
        error: (error) => {
          console.warn(
            `[${this.providerName}] Keep-alive ping невдалий:`,
            error.message
          );
          // Не зупиняємо keep-alive при помилці, можливо сервер тимчасово недоступний
        },
      });
  }

  /**
   * Визначає URL для ping запитів
   */
  private getPingUrl(): string {
    if (this.config?.serverUrl) {
      return `${this.config.serverUrl}/api/room/status`;
    }

    // Автоматичне визначення URL
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/room/status`;
    }

    // Fallback для SSR
    return '/api/room/status';
  }
}
