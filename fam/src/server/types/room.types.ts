export interface Room {
  users: string[];
  offer: RTCSessionDescriptionInit | null;
  answer: RTCSessionDescriptionInit | null;
  iceCandidates: IceCandidate[];
}

export interface IceCandidate {
  candidate: RTCIceCandidateInit;
  timestamp: number;
}

export interface JoinRoomResult {
  success: boolean;
  error?: string;
  isFirst?: boolean;
  usersCount?: number;
}

export interface RoomStatus {
  usersCount: number;
  hasOffer: boolean;
  hasAnswer: boolean;
  iceCandidatesCount: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}
