import { Injectable, inject } from '@angular/core';
import { HostingProvider, HostingConfig } from './hosting-provider.interface';
import { HostingFactoryService } from './hosting-factory.service';

/**
 * Основний сервіс для управління hosting провайдерами
 * Надає уніфікований API для роботи з різними хостингами
 */
@Injectable({
  providedIn: 'root',
})
export class HostingService {
  private factory = inject(HostingFactoryService);
  private provider: HostingProvider | null = null;

  /**
   * Ініціалізує hosting сервіс з автоматичним визначенням провайдера
   */
  initialize(config?: Partial<HostingConfig>): void {
    const hostingType = this.factory.detectHostingType();

    const defaultConfig: HostingConfig = {
      enabled: true,
      interval: 12 * 60 * 1000, // 12 хвилин
      ...config,
    };

    this.provider = this.factory.createProvider(hostingType, defaultConfig);

    console.log(
      `[HostingService] Ініціалізовано з провайдером: ${this.provider.getProviderName()}`
    );
  }

  /**
   * Запускає keep-alive механізм під час активного відеочату
   */
  startCallKeepAlive(): void {
    if (!this.provider) {
      console.warn('[HostingService] Провайдер не ініціалізований');
      return;
    }

    console.log('[HostingService] Запуск keep-alive для відеочату');
    this.provider.startKeepAlive();
  }

  /**
   * Зупиняє keep-alive механізм після завершення відеочату
   */
  stopCallKeepAlive(): void {
    if (!this.provider) {
      console.warn('[HostingService] Провайдер не ініціалізований');
      return;
    }

    console.log('[HostingService] Зупинка keep-alive після відеочату');
    this.provider.stopKeepAlive();
  }

  /**
   * Перевіряє чи активний keep-alive
   */
  isKeepAliveActive(): boolean {
    return this.provider?.isKeepAliveActive() ?? false;
  }

  /**
   * Повертає назву поточного провайдера
   */
  getCurrentProviderName(): string {
    return this.provider?.getProviderName() ?? 'none';
  }

  /**
   * Повертає поточний провайдер (для розширеної функціональності)
   */
  getCurrentProvider(): HostingProvider | null {
    return this.provider;
  }
}
