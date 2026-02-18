import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!/^erd1[a-z0-9]{58}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    // TODO: Verify signature properly
    const isValid = true;

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const token = jwt.sign({ address }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
