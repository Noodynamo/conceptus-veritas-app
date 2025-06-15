/**
 * Data Transfer Object for subscription tier from external sources.
 */
export interface SubscriptionDto {
  id: string;
  tier_type: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  features: {
    id: string;
    name: string;
    description: string;
    is_enabled: boolean;
    usage_limit?: number;
  }[];
}

/**
 * Data Transfer Object for user subscription data.
 */
export interface UserSubscriptionDto {
  user_id: string;
  subscription_id: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  auto_renew: boolean;
  feature_usage: {
    feature_id: string;
    current_usage: number;
  }[];
}
