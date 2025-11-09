import { Router, Request, Response } from 'express';
import { roomManager } from '../services/room-manager.service.js';
import { generateUserId } from '../utils/user.utils.js';

export const roomRoutes = Router();

// POST /api/room/join - підключення до кімнати
roomRoutes.post('/join', (req: Request, res: Response) => {
  try {
    const userId = generateUserId();
    const result = roomManager.joinRoom(userId);

    if (result.success) {
      res.json({
        success: true,
        userId,
        isFirst: result.isFirst,
        usersCount: result.usersCount,
        message: result.isFirst
          ? 'Очікування співрозмовника...'
          : 'Співрозмовник знайдений!',
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// GET /api/room/status - перевірка статусу кімнати
roomRoutes.get('/status', (req: Request, res: Response) => {
  try {
    const status = roomManager.getRoomStatus();
    res.json(status);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// POST /api/room/offer - відправка WebRTC offer
roomRoutes.post('/offer', (req: Request, res: Response) => {
  try {
    const { offer } = req.body;

    if (!offer) {
      return res
        .status(400)
        .json({ success: false, error: 'Offer is required' });
    }

    const result = roomManager.setOffer(offer);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// GET /api/room/offer - отримання WebRTC offer
roomRoutes.get('/offer', (req: Request, res: Response) => {
  try {
    const result = roomManager.getOffer();
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// POST /api/room/answer - відправка WebRTC answer
roomRoutes.post('/answer', (req: Request, res: Response) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res
        .status(400)
        .json({ success: false, error: 'Answer is required' });
    }

    const result = roomManager.setAnswer(answer);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// GET /api/room/answer - отримання WebRTC answer
roomRoutes.get('/answer', (req: Request, res: Response) => {
  try {
    const result = roomManager.getAnswer();
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// POST /api/room/ice - відправка ICE candidate
roomRoutes.post('/ice', (req: Request, res: Response) => {
  try {
    const { candidate } = req.body;

    if (!candidate) {
      return res
        .status(400)
        .json({ success: false, error: 'ICE candidate is required' });
    }

    const result = roomManager.addIceCandidate(candidate);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// GET /api/room/ice - отримання ICE candidates
roomRoutes.get('/ice', (req: Request, res: Response) => {
  try {
    const fromTimestamp = parseInt(req.query.from as string) || 0;
    const result = roomManager.getIceCandidates(fromTimestamp);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// POST /api/room/leave - вихід з кімнати
roomRoutes.post('/leave', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: 'User ID is required' });
    }

    const result = roomManager.leaveRoom(userId);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});
