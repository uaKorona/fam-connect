/**
 * Інтерфейс для різних hosting провайдерів
 * Дозволяє абстрагувати специфічну логіку кожного хостингу
 */
export interface HostingProvider {
  /**
   * Запускає механізм keep-alive для запобігання засинанню сервера
   */
  startKeepAlive(): void;

  /**
   * Зупиняє механізм keep-alive
   */
  stopKeepAlive(): void;

  /**
   * Перевіряє, чи активний keep-alive механізм
   */
  isKeepAliveActive(): boolean;

  /**
   * Повертає назву провайдера
   */
  getProviderName(): string;

  /**
   * Ініціалізує провайдер з конфігурацією
   */
  initialize(config: HostingConfig): void;
}

export interface HostingConfig {
  /**
   * Чи увімкнений keep-alive
   */
  enabled: boolean;

  /**
   * Інтервал між keep-alive запитами (мс)
   */
  interval: number;

  /**
   * URL сервера для ping запитів
   */
  serverUrl?: string;

  /**
   * Додаткові налаштування специфічні для провайдера
   */
  providerSpecific?: Record<string, any>;
}

export type HostingProviderType =
  | 'render'
  | 'vercel'
  | 'railway'
  | 'netlify'
  | 'local';
