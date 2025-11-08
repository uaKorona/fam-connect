import { Injectable, inject } from '@angular/core';
import { SignalingService } from './signaling.service';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  WAITING = 'waiting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

@Injectable({
  providedIn: 'root',
})
export class WebRTCService {
  private signalingService = inject(SignalingService);

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  // Стан з'єднання
  private connectionState$ = new BehaviorSubject<ConnectionState>(
    ConnectionState.DISCONNECTED
  );
  private isFirstUser = false;

  // Polling для перевірки стану кімнати
  private pollingSubscription: Subscription | null = null;
  private lastIceTimestamp = 0;

  // WebRTC конфігурація
  private readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor() {}

  // Отримання стану з'єднання
  getConnectionState() {
    return this.connectionState$.asObservable();
  }

  // Отримання локального відеопотоку
  getLocalStream() {
    return this.localStream;
  }

  // Отримання віддаленого відеопотоку
  getRemoteStream() {
    return this.remoteStream;
  }

  // Початок відеодзвінка
  async startCall(): Promise<void> {
    try {
      this.connectionState$.next(ConnectionState.CONNECTING);

      // Отримання доступу до камери та мікрофона
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Підключення до кімнати
      const joinResponse = await this.signalingService.joinRoom().toPromise();

      if (!joinResponse?.success) {
        throw new Error(joinResponse?.error || 'Failed to join room');
      }

      this.signalingService.setUserId(joinResponse.userId);
      this.isFirstUser = joinResponse.isFirst;

      // Створення RTCPeerConnection
      this.createPeerConnection();

      if (this.isFirstUser) {
        this.connectionState$.next(ConnectionState.WAITING);
        // Перший користувач чекає на другого
        this.startPolling();
      } else {
        // Другий користувач ініціює WebRTC з'єднання
        await this.initiateConnection();
      }
    } catch (error) {
      console.error('Error starting call:', error);
      this.connectionState$.next(ConnectionState.ERROR);
      throw error;
    }
  }

  // Створення RTCPeerConnection
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Додавання локального потоку
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Обробка віддаленого потоку
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.connectionState$.next(ConnectionState.CONNECTED);
    };

    // Обробка ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingService.sendIceCandidate(event.candidate).subscribe();
      }
    };

    // Обробка стану з'єднання
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);

      if (state === 'connected') {
        this.connectionState$.next(ConnectionState.CONNECTED);
      } else if (state === 'failed' || state === 'disconnected') {
        this.connectionState$.next(ConnectionState.ERROR);
      }
    };
  }

  // Ініціація з'єднання (для другого користувача)
  private async initiateConnection(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      // Створення offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Відправка offer на сервер
      await this.signalingService.sendOffer(offer).toPromise();

      // Початок polling для отримання answer та ICE candidates
      this.startPolling();
    } catch (error) {
      console.error('Error initiating connection:', error);
      this.connectionState$.next(ConnectionState.ERROR);
    }
  }

  // Polling для перевірки стану кімнати
  private startPolling(): void {
    this.pollingSubscription = interval(2000).subscribe(() => {
      this.checkForUpdates();
    });
  }

  // Перевірка оновлень від сервера
  private async checkForUpdates(): Promise<void> {
    try {
      if (this.isFirstUser) {
        // Перший користувач чекає на offer
        const offerResponse = await this.signalingService
          .getOffer()
          .toPromise();
        if (offerResponse?.offer && this.peerConnection) {
          await this.handleOffer(offerResponse.offer);
        }
      } else {
        // Другий користувач чекає на answer
        const answerResponse = await this.signalingService
          .getAnswer()
          .toPromise();
        if (answerResponse?.answer && this.peerConnection) {
          await this.handleAnswer(answerResponse.answer);
        }
      }

      // Перевірка ICE candidates для обох користувачів
      const iceResponse = await this.signalingService
        .getIceCandidates(this.lastIceTimestamp)
        .toPromise();
      if (iceResponse?.candidates && iceResponse.candidates.length > 0) {
        await this.handleIceCandidates(iceResponse.candidates);
        this.lastIceTimestamp = Date.now();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  // Обробка отриманого offer (для першого користувача)
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(offer);

      // Створення answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Відправка answer на сервер
      await this.signalingService.sendAnswer(answer).toPromise();
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  // Обробка отриманого answer (для другого користувача)
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  // Обробка ICE candidates
  private async handleIceCandidates(
    candidates: RTCIceCandidateInit[]
  ): Promise<void> {
    if (!this.peerConnection) return;

    try {
      for (const candidate of candidates) {
        await this.peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidates:', error);
    }
  }

  // Завершення дзвінка
  async endCall(): Promise<void> {
    try {
      // Зупинка polling
      if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
        this.pollingSubscription = null;
      }

      // Зупинка локального потоку
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }

      // Закриття peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Вихід з кімнати на сервері
      if (this.signalingService.getUserId()) {
        await this.signalingService.leaveRoom().toPromise();
        this.signalingService.clearUserId();
      }

      // Скидання стану
      this.remoteStream = null;
      this.isFirstUser = false;
      this.lastIceTimestamp = 0;
      this.connectionState$.next(ConnectionState.DISCONNECTED);
    } catch (error) {
      console.error('Error ending call:', error);
      this.connectionState$.next(ConnectionState.DISCONNECTED);
    }
  }
}
