import express from 'express';
import auth from '../middleware/auth.mjs';
import Session from '../models/Session.mjs';
import User from '../models/User.mjs';

const router = express.Router();

// Get all sessions for a user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new session
router.post('/', auth, async (req, res) => {
  try {
    const { topic, level, stage } = req.body;
    const session = new Session({
      user: req.user._id,
      topic: "New Topic",
      level: "0",
      stage: "Setup",
      transcript: [{tutor: "Hi, how can I help you today?"}],
      inputTranscript: [{tutor: "Hi, how can I help you today?"}],
      equations: [],
      graphingEquations: [],
      notes: ""
    });
    
    await session.save();
    
    // Add session to user's sessions array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { sessions: session._id } }
    );

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a session
router.patch('/:id', auth, async (req, res) => {
  try {
    console.log('PATCH request received for session:', req.params.id);
    console.log('Request body:', req.body);
    
    const updates = Object.keys(req.body);
    const allowedUpdates = ['topic', 'level', 'stage', 'transcript', 'inputTranscript', 'equations', 'graphingEquations', 'notes', 'status'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      console.log('Invalid updates:', updates);
      return res.status(400).json({ message: 'Invalid updates' });
    }

    console.log('Applying updates:', updates);
    
    // Use atomic update to avoid version conflicts
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!session) {
      console.log('Session not found');
      return res.status(404).json({ message: 'Session not found' });
    }

    console.log('Session updated successfully');
    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Remove session from user's sessions array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { sessions: session._id } }
    );

    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 