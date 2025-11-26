import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { SubscriptionService } from '../services/SubscriptionService';
import { SubscriptionBundleRepository } from '../../infrastructure/repositories/SubscriptionBundleRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

const router = Router();

// Initialize dependencies
const subscriptionBundleRepository = new SubscriptionBundleRepository();
const userRepository = new UserRepository();

const subscriptionService = new SubscriptionService(subscriptionBundleRepository, userRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

// Routes
router.post('/users/:userId/subscriptions', (req, res) =>
  subscriptionController.createSubscription(req, res)
);
router.get('/users/:userId/subscriptions', (req, res) =>
  subscriptionController.getUserSubscriptions(req, res)
);
router.get('/users/:userId/subscriptions/active', (req, res) =>
  subscriptionController.getActiveSubscriptions(req, res)
);
router.post('/users/:userId/subscriptions/:bundleId/cancel', (req, res) =>
  subscriptionController.cancelSubscription(req, res)
);

export default router;

