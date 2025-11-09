import { Injectable, inject } from '@angular/core';
import {
  HostingProvider,
  HostingConfig,
  HostingProviderType,
} from './hosting-provider.interface';
import { RenderHostingService } from './render-hosting.service';
import { LocalHostingService } from './local-hosting.service';

/**
 * Factory для створення відповідного hosting провайдера
 * Автоматично визначає тип хостингу та повертає відповідну реалізацію
 */
@Injectable({
  providedIn: 'root',
})
export class HostingFactoryService {
  private renderHosting = inject(RenderHostingService);
  private localHosting = inject(LocalHostingService);

  /**
   * Створює hosting провайдер на основі конфігурації
   */
  createProvider(
    type: HostingProviderType,
    config: HostingConfig
  ): HostingProvider {
    let provider: HostingProvider;

    switch (type) {
      case 'render':
        provider = this.renderHosting;
        break;
      case 'local':
        provider = this.localHosting;
        break;
      case 'vercel':
      case 'railway':
      case 'netlify':
        // TODO: Імплементувати інші провайдери в майбутньому
        console.warn(
          `Провайдер ${type} ще не реалізований, використовуємо local`
        );
        provider = this.localHosting;
        break;
      default:
        console.warn(`Невідомий провайдер ${type}, використовуємо local`);
        provider = this.localHosting;
    }

    provider.initialize(config);
    return provider;
  }

  /**
   * Автоматично визначає тип хостингу на основі environment variables
   * або URL домену
   */
  detectHostingType(): HostingProviderType {
    // Перевіряємо чи це браузерне середовище
    if (typeof window === 'undefined') {
      // SSR або Node.js середовище
      return this.detectServerEnvironment();
    }

    // Клієнтське середовище
    return this.detectClientEnvironment();
  }

  /**
   * Визначає тип хостингу на сервері
   */
  private detectServerEnvironment(): HostingProviderType {
    // Environment variables які встановлюють різні хостинги
    if (process.env['RENDER']) {
      return 'render';
    }
    if (process.env['VERCEL']) {
      return 'vercel';
    }
    if (process.env['RAILWAY_ENVIRONMENT']) {
      return 'railway';
    }
    if (process.env['NETLIFY']) {
      return 'netlify';
    }

    return 'local';
  }

  /**
   * Визначає тип хостингу в браузері
   */
  private detectClientEnvironment(): HostingProviderType {
    const hostname = window.location.hostname;

    if (hostname.includes('.onrender.com')) {
      return 'render';
    }
    if (hostname.includes('.vercel.app')) {
      return 'vercel';
    }
    if (hostname.includes('.up.railway.app')) {
      return 'railway';
    }
    if (hostname.includes('.netlify.app')) {
      return 'netlify';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'local';
    }

    // Якщо не можемо визначити, припускаємо що це custom domain на Render
    // (оскільки це наш основний target)
    return 'render';
  }
}
