import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription-service';
import { AppError } from '../../domain/errors/app-error';
import { BundleTier, BillingCycle } from '../../domain/entities/subscription-bundle';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { tier, billingCycle, autoRenew } = req.body;

      // Validation
      if (!tier || !Object.values(BundleTier).includes(tier)) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: `Invalid tier. Must be one of: ${Object.values(BundleTier).join(', ')}`,
        });
        return;
      }

      if (!billingCycle || !Object.values(BillingCycle).includes(billingCycle)) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: `Invalid billing cycle. Must be one of: ${Object.values(BillingCycle).join(', ')}`,
        });
        return;
      }

      const subscription = await this.subscriptionService.createSubscription({
        userId,
        tier,
        billingCycle,
        autoRenew: autoRenew !== undefined ? Boolean(autoRenew) : false,
      });

      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getActiveSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const subscriptions = await this.subscriptionService.getActiveSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const bundleId = req.params.bundleId;

      const subscription = await this.subscriptionService.cancelSubscription(bundleId, userId);

      res.status(200).json({
        success: true,
        data: subscription,
        message: 'Subscription cancelled successfully. It will remain active until the end of the current billing cycle.',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: error.code || 'ERROR',
        message: error.message,
      });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }
}

