import { SubscriptionTier } from '../../entities/subscription/SubscriptionTier';
import { SubscriptionRepository } from '../../repositories/subscription/SubscriptionRepository';

/**
 * Use case for retrieving a user's subscription tier.
 * Follows the Clean Architecture principle of having use cases that
 * encapsulate application-specific business rules.
 */
export class GetUserSubscriptionUseCase {
  /**
   * Creates an instance of GetUserSubscriptionUseCase.
   * @param subscriptionRepository The repository for subscription data access
   */
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  /**
   * Executes the use case to retrieve a user's subscription tier.
   * @param userId The ID of the user
   * @returns A Promise resolving to the user's subscription tier
   */
  async execute(userId: string): Promise<SubscriptionTier> {
    try {
      return await this.subscriptionRepository.getUserSubscription(userId);
    } catch (error: unknown) {
      // Re-throw the error with additional context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get user subscription: ${errorMessage}`);
    }
  }
}
