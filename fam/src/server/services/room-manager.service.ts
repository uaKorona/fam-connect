import {
  Room,
  IceCandidate,
  JoinRoomResult,
  RoomStatus,
} from '../types/room.types.js';

/**
 * Простий менеджер кімнати для зберігання стану в пам'яті
 */
export class RoomManager {
  private room: Room;

  constructor() {
    // В даній реалізації підтримується тільки одна кімната з максимум 2 користувачами
    this.room = {
      users: [],
      offer: null,
      answer: null,
      iceCandidates: [],
    };
  }

  /**
   * Підключення користувача до кімнати
   */
  joinRoom(userId: string): JoinRoomResult {
    if (this.room.users.length >= 2) {
      return { success: false, error: 'Room is full' };
    }

    if (!this.room.users.includes(userId)) {
      this.room.users.push(userId);
    }

    return {
      success: true,
      isFirst: this.room.users.length === 1,
      usersCount: this.room.users.length,
    };
  }

  /**
   * Вихід користувача з кімнати
   */
  leaveRoom(userId: string): { success: boolean; usersCount: number } {
    this.room.users = this.room.users.filter((id) => id !== userId);

    // Очищуємо кімнату якщо всі користувачі вийшли
    if (this.room.users.length === 0) {
      this.room.offer = null;
      this.room.answer = null;
      this.room.iceCandidates = [];
    }

    return { success: true, usersCount: this.room.users.length };
  }

  /**
   * Отримання статусу кімнати
   */
  getRoomStatus(): RoomStatus {
    return {
      usersCount: this.room.users.length,
      hasOffer: !!this.room.offer,
      hasAnswer: !!this.room.answer,
      iceCandidatesCount: this.room.iceCandidates.length,
    };
  }

  /**
   * Збереження WebRTC offer
   */
  setOffer(offer: RTCSessionDescriptionInit): { success: boolean } {
    this.room.offer = offer;
    return { success: true };
  }

  /**
   * Отримання WebRTC offer
   */
  getOffer(): { offer: RTCSessionDescriptionInit | null } {
    return { offer: this.room.offer };
  }

  /**
   * Збереження WebRTC answer
   */
  setAnswer(answer: RTCSessionDescriptionInit): { success: boolean } {
    this.room.answer = answer;
    return { success: true };
  }

  /**
   * Отримання WebRTC answer
   */
  getAnswer(): { answer: RTCSessionDescriptionInit | null } {
    return { answer: this.room.answer };
  }

  /**
   * Додавання ICE candidate
   */
  addIceCandidate(candidate: RTCIceCandidateInit): { success: boolean } {
    this.room.iceCandidates.push({
      candidate,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  /**
   * Отримання ICE candidates
   */
  getIceCandidates(fromTimestamp = 0): { candidates: RTCIceCandidateInit[] } {
    const candidates = this.room.iceCandidates
      .filter((ice: IceCandidate) => ice.timestamp > fromTimestamp)
      .map((ice: IceCandidate) => ice.candidate);

    return { candidates };
  }
}

export const roomManager = new RoomManager();
