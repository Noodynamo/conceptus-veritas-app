import { GetUserSubscriptionUseCase } from '../GetUserSubscriptionUseCase';
import { SubscriptionTier, TierType } from '../../../entities/subscription/SubscriptionTier';

describe('GetUserSubscriptionUseCase', () => {
  // Mock subscription repository
  const mockSubscriptionRepository = {
    getUserSubscription: jest.fn(),
    getAllTiers: jest.fn(),
    upgradeTier: jest.fn(),
    downgradeTier: jest.fn(),
    hasFeatureAccess: jest.fn(),
    getFeatureUsageLimit: jest.fn(),
    getFeatureCurrentUsage: jest.fn(),
    incrementFeatureUsage: jest.fn(),
  };

  // Mock subscription data
  const mockSubscription: SubscriptionTier = {
    id: 'premium-123',
    type: TierType.PREMIUM,
    name: 'Premium',
    description: 'Premium tier with advanced features',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    features: [
      {
        id: 'feature-1',
        name: 'Advanced Analytics',
        description: 'Access to advanced analytics',
        isEnabled: true,
      },
      {
        id: 'feature-2',
        name: 'Custom Reports',
        description: 'Create custom reports',
        isEnabled: true,
        usageLimit: 10,
      },
    ],
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get user subscription successfully', async () => {
    // Arrange
    const userId = 'user-123';
    mockSubscriptionRepository.getUserSubscription.mockResolvedValue(mockSubscription);
    const useCase = new GetUserSubscriptionUseCase(mockSubscriptionRepository);

    // Act
    const result = await useCase.execute(userId);

    // Assert
    expect(result).toEqual(mockSubscription);
    expect(mockSubscriptionRepository.getUserSubscription).toHaveBeenCalledWith(userId);
    expect(mockSubscriptionRepository.getUserSubscription).toHaveBeenCalledTimes(1);
  });

  it('should throw error when repository fails', async () => {
    // Arrange
    const userId = 'user-123';
    const error = new Error('Repository error');
    mockSubscriptionRepository.getUserSubscription.mockRejectedValue(error);
    const useCase = new GetUserSubscriptionUseCase(mockSubscriptionRepository);

    // Act & Assert
    await expect(useCase.execute(userId)).rejects.toThrow(
      'Failed to get user subscription: Repository error'
    );
    expect(mockSubscriptionRepository.getUserSubscription).toHaveBeenCalledWith(userId);
    expect(mockSubscriptionRepository.getUserSubscription).toHaveBeenCalledTimes(1);
  });
});
