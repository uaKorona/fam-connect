Відмінно! Ось детальний план імплементації з HTTP сигналінгом:

## Детальний план імплементації відеочату

### 1. **Backend API (Express)**

```
POST /api/room/join - підключення до кімнати
GET /api/room/status - перевірка статусу кімнати
POST /api/room/offer - відправка WebRTC offer
POST /api/room/answer - відправка WebRTC answer
POST /api/room/ice - відправка ICE candidates
POST /api/room/leave - вихід з кімнати
```

### 2. **Frontend компоненти (Angular)**

- `VideoCallComponent` - головний компонент
- `WebRTCService` - управління WebRTC
- `SignalingService` - HTTP комунікація з API

### 3. **Структура файлів для створення:**

```
src/app/
├── components/
│   └── video-call/
│       ├── video-call.component.ts
│       ├── video-call.component.html
│       └── video-call.component.css
├── services/
│   ├── webrtc.service.ts
│   └── signaling.service.ts
└── models/
    └── room.model.ts

server/
└── routes/
    └── room.routes.js
```

### 4. **Покрокова реалізація:**

#### Крок 1: Backend API

- Створити роут `/api/room/*`
- В пам'яті зберігати стан кімнати (максимум 2 користувачі)
- API для обміну WebRTC повідомленнями

#### Крок 2: Angular сервіси

- `SignalingService` - HTTP запити до API
- `WebRTCService` - управління камерою та WebRTC з'єднанням

#### Крок 3: UI компонент

- Кнопка "Підключитися" / "Завершити"
- Два відео елементи (свій/співрозмовник)
- Стани: початковий, очікування, активний дзвінок

#### Крок 4: Логіка з'єднання

- Polling кожні 2 секунди для перевірки статусу
- WebRTC handshake через HTTP API
- Управління станами з'єднання

Готові почати реалізацію? Якщо так, попросіть "toggle to Act mode" і я розпочну створення коду.
