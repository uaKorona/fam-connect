import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRTCService, ConnectionState } from '../../services/webrtc.service';
import { HostingService } from '../../services/hosting/hosting.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css'],
})
export class VideoCallComponent implements OnInit, OnDestroy {
  private webrtcService = inject(WebRTCService);
  private hostingService = inject(HostingService);

  @ViewChild('localVideo', { static: true })
  localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true })
  remoteVideoRef!: ElementRef<HTMLVideoElement>;

  currentState: ConnectionState = ConnectionState.DISCONNECTED;
  statusMessage = '';
  isCallActive = false;

  private stateSubscription?: Subscription;

  // Експортуємо enum для використання в шаблоні
  readonly ConnectionState = ConnectionState;

  ngOnInit(): void {
    // Ініціалізація hosting сервісу
    this.hostingService.initialize();

    // Підписка на зміни стану з'єднання
    this.stateSubscription = this.webrtcService
      .getConnectionState()
      .subscribe((state) => {
        this.currentState = state;
        this.updateStatusMessage();
        this.updateVideoStreams();
        this.handleHostingKeepAlive(state);
      });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    // Автоматичне завершення дзвінка при знищенні компонента
    if (this.isCallActive) {
      this.endCall();
    }
    // Зупиняємо keep-alive при знищенні компонента
    this.hostingService.stopCallKeepAlive();
  }

  // Початок відеодзвінка
  async startCall(): Promise<void> {
    try {
      this.isCallActive = true;
      await this.webrtcService.startCall();
    } catch (error) {
      console.error('Error starting call:', error);
      this.isCallActive = false;
      this.statusMessage =
        'Помилка підключення. Перевірте дозвіл на камеру та мікрофон.';
    }
  }

  // Завершення відеодзвінка
  async endCall(): Promise<void> {
    try {
      await this.webrtcService.endCall();
      this.isCallActive = false;
      this.clearVideoElements();
      // Зупиняємо keep-alive після завершення дзвінка
      this.hostingService.stopCallKeepAlive();
    } catch (error) {
      console.error('Error ending call:', error);
      this.isCallActive = false;
      // Все одно зупиняємо keep-alive при помилці
      this.hostingService.stopCallKeepAlive();
    }
  }

  // Оновлення повідомлення про статус
  private updateStatusMessage(): void {
    switch (this.currentState) {
      case ConnectionState.DISCONNECTED:
        this.statusMessage = 'Готовий до підключення';
        break;
      case ConnectionState.CONNECTING:
        this.statusMessage = 'Підключення...';
        break;
      case ConnectionState.WAITING:
        this.statusMessage = 'Очікування співрозмовника...';
        break;
      case ConnectionState.CONNECTED:
        this.statusMessage = "З'єднано! Розмова активна";
        break;
      case ConnectionState.ERROR:
        this.statusMessage = "Помилка з'єднання";
        break;
      default:
        this.statusMessage = '';
    }
  }

  // Оновлення відеопотоків
  private updateVideoStreams(): void {
    // Локальне відео
    const localStream = this.webrtcService.getLocalStream();
    if (localStream && this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = localStream;
    }

    // Віддалене відео
    const remoteStream = this.webrtcService.getRemoteStream();
    if (remoteStream && this.remoteVideoRef?.nativeElement) {
      this.remoteVideoRef.nativeElement.srcObject = remoteStream;
    }
  }

  // Очищення відео елементів
  private clearVideoElements(): void {
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = null;
    }
    if (this.remoteVideoRef?.nativeElement) {
      this.remoteVideoRef.nativeElement.srcObject = null;
    }
  }

  // Перевірка чи показувати кнопку "Підключитися"
  canStartCall(): boolean {
    return (
      !this.isCallActive && this.currentState === ConnectionState.DISCONNECTED
    );
  }

  // Перевірка чи показувати кнопку "Завершити"
  canEndCall(): boolean {
    return (
      this.isCallActive && this.currentState !== ConnectionState.DISCONNECTED
    );
  }

  // Перевірка чи показувати статус очікування
  isWaiting(): boolean {
    return this.currentState === ConnectionState.WAITING;
  }

  // Перевірка чи з'єднання активне
  isConnected(): boolean {
    return this.currentState === ConnectionState.CONNECTED;
  }

  // Перевірка чи є помилка
  hasError(): boolean {
    return this.currentState === ConnectionState.ERROR;
  }

  /**
   * Управляє keep-alive механізмом на основі стану з'єднання
   */
  private handleHostingKeepAlive(state: ConnectionState): void {
    switch (state) {
      case ConnectionState.CONNECTING:
      case ConnectionState.WAITING:
        // Запускаємо keep-alive при початку процесу з'єднання
        this.hostingService.startCallKeepAlive();
        break;
      case ConnectionState.CONNECTED:
        // Продовжуємо keep-alive під час активного дзвінка
        if (!this.hostingService.isKeepAliveActive()) {
          this.hostingService.startCallKeepAlive();
        }
        break;
      case ConnectionState.DISCONNECTED:
      case ConnectionState.ERROR:
        // Зупиняємо keep-alive при відключенні або помилці
        this.hostingService.stopCallKeepAlive();
        break;
    }
  }

  /**
   * Повертає назву поточного hosting провайдера для відображення в UI
   */
  getHostingProviderName(): string {
    return this.hostingService.getCurrentProviderName();
  }

  /**
   * Перевіряє чи активний keep-alive механізм
   */
  isKeepAliveActive(): boolean {
    return this.hostingService.isKeepAliveActive();
  }
}
