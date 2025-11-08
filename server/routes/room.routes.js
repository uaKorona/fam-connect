const express = require('express');
const roomManager = require('../room-manager');
const router = express.Router();

// Генерація простого унікального ID для користувача
function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}

// POST /api/room/join - підключення до кімнати
router.post('/join', (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/room/status - перевірка статусу кімнати
router.get('/status', (req, res) => {
  try {
    const status = roomManager.getRoomStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/room/offer - відправка WebRTC offer
router.post('/offer', (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/room/offer - отримання WebRTC offer
router.get('/offer', (req, res) => {
  try {
    const result = roomManager.getOffer();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/room/answer - відправка WebRTC answer
router.post('/answer', (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/room/answer - отримання WebRTC answer
router.get('/answer', (req, res) => {
  try {
    const result = roomManager.getAnswer();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/room/ice - відправка ICE candidate
router.post('/ice', (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/room/ice - отримання ICE candidates
router.get('/ice', (req, res) => {
  try {
    const fromTimestamp = parseInt(req.query.from) || 0;
    const result = roomManager.getIceCandidates(fromTimestamp);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/room/leave - вихід з кімнати
router.post('/leave', (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
