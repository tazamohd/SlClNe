import type { DomainScreens } from '../registry'
import { MarketingHub } from '../marketing/MarketingHub'
import { MarketingAutomation } from '../marketing/MarketingAutomation'
import { LoyaltyProgram } from '../marketing/LoyaltyProgram'
import { GoogleMyBusiness } from '../marketing/GoogleMyBusiness'
import { SocialMediaIntegration } from '../marketing/SocialMediaIntegration'
import { SocialMediaMonitoring } from '../marketing/SocialMediaMonitoring'
import { EmailMarketingCampaigns } from '../marketing/EmailMarketingCampaigns'

export const SCREENS: DomainScreens = {
  'Marketing-Hub': MarketingHub,
  'Marketing-Automation': MarketingAutomation,
  'Loyalty-Program': LoyaltyProgram,
  'Google-My-Business': GoogleMyBusiness,
  'Social-Media-Integration': SocialMediaIntegration,
  'Social-Media-Monitoring': SocialMediaMonitoring,
  'Email-Marketing-Campaigns': EmailMarketingCampaigns,
}
