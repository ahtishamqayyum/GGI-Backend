import { Request, Response } from 'express';
import { ChatService } from '../services/chat-service';
import { AppError } from '../../domain/errors/app-error';

export class ChatController {
  constructor(private chatService: ChatService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { question } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Question is required and must be a non-empty string',
        });
        return;
      }

      const response = await this.chatService.sendMessage(userId, question.trim());

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const messages = await this.chatService.getChatHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: messages,
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

