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
    // Підписка на зміни стану з'єднання
    this.stateSubscription = this.webrtcService
      .getConnectionState()
      .subscribe((state) => {
        this.currentState = state;
        this.updateStatusMessage();
        this.updateVideoStreams();
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
    } catch (error) {
      console.error('Error ending call:', error);
      this.isCallActive = false;
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
}
