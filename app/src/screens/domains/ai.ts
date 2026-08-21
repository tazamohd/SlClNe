/** Screens owned by agent 15 — AI / Automation.
 *
 *  The AI hub, prompt library, knowledge base, workflow builder and automation rules — every consequential action behind a human confirmation gate.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { AIAssistant } from '../ai/AIAssistant'
import { AIAnalytics } from '../ai/AIAnalytics'
import { PromptLibrary } from '../ai/PromptLibrary'
import { ModelSettings } from '../ai/ModelSettings'
import { KnowledgeBase } from '../ai/KnowledgeBase'
import { AIAutomation } from '../ai/AIAutomation'
import { AIChatbot } from '../ai/AIChatbot'
import { AIChatbotAssistant } from '../ai/AIChatbotAssistant'
import { AIServiceAdvisor } from '../ai/AIServiceAdvisor'
import { SmartDamageAssessment } from '../ai/SmartDamageAssessment'
import { MLFraudDetection } from '../ai/MLFraudDetection'
import { NeuralNetworkPrediction } from '../ai/NeuralNetworkPrediction'
import { SmartPartsRecommendations } from '../ai/SmartPartsRecommendations'
import { IntelligentPriceOptimizer } from '../ai/IntelligentPriceOptimizer'

export const SCREENS: DomainScreens = {
  AIAssistant,
  AIAnalytics,
  PromptLibrary,
  ModelSettings,
  KnowledgeBase,
  'AI-Automation': AIAutomation,
  'AI-Chatbot': AIChatbot,
  'AI-Chatbot-Assistant': AIChatbotAssistant,
  'AI-Service-Advisor': AIServiceAdvisor,
  'Smart-Damage-Assessment': SmartDamageAssessment,
  'ML-Fraud-Detection': MLFraudDetection,
  'Neural-Network-Prediction': NeuralNetworkPrediction,
  'Smart-Parts-Recommendations': SmartPartsRecommendations,
  'Intelligent-Price-Optimizer': IntelligentPriceOptimizer,
}
