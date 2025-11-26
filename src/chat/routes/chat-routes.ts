import { Router } from 'express';
import { ChatController } from '../controllers/chat-controller';
import { ChatService } from '../services/chat-service';
import { ChatMessageRepository } from '../../infrastructure/repositories/chat-message-repository';
import { UserRepository } from '../../infrastructure/repositories/user-repository';
import { SubscriptionBundleRepository } from '../../infrastructure/repositories/subscription-bundle-repository';
import { UserMonthlyUsageRepository } from '../../infrastructure/repositories/user-monthly-usage-repository';

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

