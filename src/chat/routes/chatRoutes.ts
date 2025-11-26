import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { ChatService } from '../services/ChatService';
import { ChatMessageRepository } from '../../infrastructure/repositories/ChatMessageRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { SubscriptionBundleRepository } from '../../infrastructure/repositories/SubscriptionBundleRepository';
import { UserMonthlyUsageRepository } from '../../infrastructure/repositories/UserMonthlyUsageRepository';

const router = Router();

// Initialize dependencies
const chatMessageRepository = new ChatMessageRepository();
const userRepository = new UserRepository();
const subscriptionBundleRepository = new SubscriptionBundleRepository();
const userMonthlyUsageRepository = new UserMonthlyUsageRepository();

const chatService = new ChatService(
  chatMessageRepository,
  userRepository,
  subscriptionBundleRepository,
  userMonthlyUsageRepository
);

const chatController = new ChatController(chatService);

// Routes
router.post('/users/:userId/messages', (req, res) => chatController.sendMessage(req, res));
router.get('/users/:userId/messages', (req, res) => chatController.getChatHistory(req, res));

export default router;

