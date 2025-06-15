import {
  SubscriptionTier,
  TierType,
  SubscriptionFeature,
} from '../../../domain/entities/subscription/SubscriptionTier';
import { SubscriptionDto } from './SubscriptionDto';

/**
 * Mapper class for transforming between DTO and domain entities
 * This enforces the separation of concerns between layers
 */
export class SubscriptionMapper {
  /**
   * Maps a DTO from the data layer to a domain entity
   */
  static toDomain(dto: SubscriptionDto): SubscriptionTier {
    return {
      id: dto.id,
      type: dto.tier_type as TierType,
      name: dto.name,
      description: dto.description,
      monthlyPrice: dto.monthly_price,
      annualPrice: dto.annual_price,
      features: dto.features.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        isEnabled: feature.is_enabled,
        usageLimit: feature.usage_limit,
      })),
    };
  }

  /**
   * Maps a domain entity to a DTO for the data layer
   */
  static toDto(entity: SubscriptionTier): SubscriptionDto {
    return {
      id: entity.id,
      tier_type: entity.type,
      name: entity.name,
      description: entity.description,
      monthly_price: entity.monthlyPrice,
      annual_price: entity.annualPrice,
      features: entity.features.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        is_enabled: feature.isEnabled,
        usage_limit: feature.usageLimit,
      })),
    };
  }
}
