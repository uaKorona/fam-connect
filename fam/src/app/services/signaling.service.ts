import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JoinRoomResponse {
  success: boolean;
  userId: string;
  isFirst: boolean;
  usersCount: number;
  message: string;
  error?: string;
}

export interface RoomStatus {
  usersCount: number;
  hasOffer: boolean;
  hasAnswer: boolean;
  iceCandidatesCount: number;
}

export interface OfferResponse {
  offer: RTCSessionDescriptionInit | null;
}

export interface AnswerResponse {
  answer: RTCSessionDescriptionInit | null;
}

export interface IceCandidatesResponse {
  candidates: RTCIceCandidateInit[];
}

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private readonly apiUrl = '/api/room';
  private currentUserId: string | null = null;

  constructor(private http: HttpClient) {}

  // Підключення до кімнати
  joinRoom(): Observable<JoinRoomResponse> {
    return this.http.post<JoinRoomResponse>(`${this.apiUrl}/join`, {});
  }

  // Збереження userId після успішного підключення
  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  // Отримання поточного userId
  getUserId(): string | null {
    return this.currentUserId;
  }

  // Перевірка статусу кімнати
  getRoomStatus(): Observable<RoomStatus> {
    return this.http.get<RoomStatus>(`${this.apiUrl}/status`);
  }

  // Відправка WebRTC offer
  sendOffer(
    offer: RTCSessionDescriptionInit
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/offer`, {
      offer,
    });
  }

  // Отримання WebRTC offer
  getOffer(): Observable<OfferResponse> {
    return this.http.get<OfferResponse>(`${this.apiUrl}/offer`);
  }

  // Відправка WebRTC answer
  sendAnswer(
    answer: RTCSessionDescriptionInit
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/answer`, {
      answer,
    });
  }

  // Отримання WebRTC answer
  getAnswer(): Observable<AnswerResponse> {
    return this.http.get<AnswerResponse>(`${this.apiUrl}/answer`);
  }

  // Відправка ICE candidate
  sendIceCandidate(
    candidate: RTCIceCandidateInit
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/ice`, {
      candidate,
    });
  }

  // Отримання ICE candidates
  getIceCandidates(
    fromTimestamp: number = 0
  ): Observable<IceCandidatesResponse> {
    return this.http.get<IceCandidatesResponse>(
      `${this.apiUrl}/ice?from=${fromTimestamp}`
    );
  }

  // Вихід з кімнати
  leaveRoom(): Observable<{ success: boolean; usersCount: number }> {
    if (!this.currentUserId) {
      throw new Error('User ID not set');
    }

    return this.http.post<{ success: boolean; usersCount: number }>(
      `${this.apiUrl}/leave`,
      {
        userId: this.currentUserId,
      }
    );
  }

  // Очистка userId при виході
  clearUserId(): void {
    this.currentUserId = null;
  }
}
