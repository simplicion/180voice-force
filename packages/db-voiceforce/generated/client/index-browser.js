
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logoUrl: 'logoUrl',
  currency: 'currency',
  currencySymbol: 'currencySymbol',
  voiceBalanceInr: 'voiceBalanceInr',
  voiceAutoRecharge: 'voiceAutoRecharge',
  voiceThresholdInr: 'voiceThresholdInr',
  voiceRechargeAmountInr: 'voiceRechargeAmountInr',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  email: 'email',
  name: 'name',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VoiceAgentScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  role: 'role',
  systemPrompt: 'systemPrompt',
  language: 'language',
  voiceProvider: 'voiceProvider',
  voiceId: 'voiceId',
  voiceTemperature: 'voiceTemperature',
  voiceSpeed: 'voiceSpeed',
  engineType: 'engineType',
  llmModel: 'llmModel',
  sttModel: 'sttModel',
  firstMessage: 'firstMessage',
  allowBargeIn: 'allowBargeIn',
  inactivityTimeoutMs: 'inactivityTimeoutMs',
  maxDurationSeconds: 'maxDurationSeconds',
  enabledToolNames: 'enabledToolNames',
  recordCalls: 'recordCalls',
  recordConsentText: 'recordConsentText',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PhoneNumberScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  e164Number: 'e164Number',
  friendlyName: 'friendlyName',
  provider: 'provider',
  providerId: 'providerId',
  countryCode: 'countryCode',
  capabilities: 'capabilities',
  assignedAgentId: 'assignedAgentId',
  status: 'status',
  maxConcurrent: 'maxConcurrent',
  currentActive: 'currentActive',
  routingMode: 'routingMode',
  monthlyRentalInr: 'monthlyRentalInr',
  nextRenewalDate: 'nextRenewalDate',
  autoRenew: 'autoRenew',
  coolingDownSince: 'coolingDownSince',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallCampaignScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  voiceAgentId: 'voiceAgentId',
  phoneNumberId: 'phoneNumberId',
  status: 'status',
  contactList: 'contactList',
  scheduledAt: 'scheduledAt',
  campaignGoal: 'campaignGoal',
  specialOffer: 'specialOffer',
  maxConcurrent: 'maxConcurrent',
  callsPerSecond: 'callsPerSecond',
  retryCount: 'retryCount',
  retryIntervalMins: 'retryIntervalMins',
  totalRecipients: 'totalRecipients',
  completedCalls: 'completedCalls',
  successfulCalls: 'successfulCalls',
  failedCalls: 'failedCalls',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallSessionScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  campaignId: 'campaignId',
  voiceAgentId: 'voiceAgentId',
  phoneNumberId: 'phoneNumberId',
  direction: 'direction',
  recipientPhone: 'recipientPhone',
  recipientName: 'recipientName',
  livekitRoomName: 'livekitRoomName',
  sipCallId: 'sipCallId',
  status: 'status',
  disconnectReason: 'disconnectReason',
  durationSeconds: 'durationSeconds',
  billableMinutes: 'billableMinutes',
  estimatedCostInr: 'estimatedCostInr',
  carrierCostUsd: 'carrierCostUsd',
  engineCostUsd: 'engineCostUsd',
  totalBilledUsd: 'totalBilledUsd',
  billedCurrency: 'billedCurrency',
  fxRateApplied: 'fxRateApplied',
  recordingUrl: 'recordingUrl',
  recordingDurationSeconds: 'recordingDurationSeconds',
  recordingStatus: 'recordingStatus',
  summary: 'summary',
  sentiment: 'sentiment',
  callOutcome: 'callOutcome',
  actionItems: 'actionItems',
  structuredData: 'structuredData',
  startedAt: 'startedAt',
  answeredAt: 'answeredAt',
  endedAt: 'endedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallTranscriptSegmentScalarFieldEnum = {
  id: 'id',
  callSessionId: 'callSessionId',
  speaker: 'speaker',
  text: 'text',
  startTimeMs: 'startTimeMs',
  endTimeMs: 'endTimeMs',
  interrupted: 'interrupted',
  createdAt: 'createdAt',
  companyId: 'companyId'
};

exports.Prisma.CallToolExecutionScalarFieldEnum = {
  id: 'id',
  callSessionId: 'callSessionId',
  toolName: 'toolName',
  arguments: 'arguments',
  result: 'result',
  durationMs: 'durationMs',
  isSuccess: 'isSuccess',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt',
  companyId: 'companyId'
};

exports.Prisma.VoiceWalletTransactionScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  amountInr: 'amountInr',
  balanceAfterInr: 'balanceAfterInr',
  type: 'type',
  callSessionId: 'callSessionId',
  paymentRef: 'paymentRef',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.DncRegistryScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  phoneNumber: 'phoneNumber',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.ForwardingRuleScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  phoneNumberId: 'phoneNumberId',
  name: 'name',
  strategy: 'strategy',
  ringTimeoutSec: 'ringTimeoutSec',
  destinations: 'destinations',
  scheduleEnabled: 'scheduleEnabled',
  timezone: 'timezone',
  businessHours: 'businessHours',
  fallbackType: 'fallbackType',
  fallbackAgentId: 'fallbackAgentId',
  fallbackVoicemailEmail: 'fallbackVoicemailEmail',
  maxHops: 'maxHops',
  whisperAnnouncement: 'whisperAnnouncement',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallQueueScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  maxQueueSize: 'maxQueueSize',
  maxWaitTimeSec: 'maxWaitTimeSec',
  holdMusicUrl: 'holdMusicUrl',
  announcePosition: 'announcePosition',
  currentWaiting: 'currentWaiting',
  totalProcessed: 'totalProcessed',
  avgWaitSeconds: 'avgWaitSeconds',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VoiceAgentGuardrailScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  voiceAgentId: 'voiceAgentId',
  maxDiscountPercent: 'maxDiscountPercent',
  maxDiscountAmount: 'maxDiscountAmount',
  maxOrderValue: 'maxOrderValue',
  minLeadTimeHours: 'minLeadTimeHours',
  maxAdvanceDays: 'maxAdvanceDays',
  bufferMinutes: 'bufferMinutes',
  maxDeliveryKm: 'maxDeliveryKm',
  forbiddenTopics: 'forbiddenTopics',
  pciRedactionEnabled: 'pciRedactionEnabled',
  rules: 'rules',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VoiceAgentVersionScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  voiceAgentId: 'voiceAgentId',
  versionNumber: 'versionNumber',
  changelog: 'changelog',
  snapshot: 'snapshot',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.IndustryTemplateScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  category: 'category',
  icon: 'icon',
  defaultConfig: 'defaultConfig',
  suggestedTools: 'suggestedTools',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.CallEscalationEventScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  callSessionId: 'callSessionId',
  targetType: 'targetType',
  targetNumber: 'targetNumber',
  targetUserId: 'targetUserId',
  triggerReason: 'triggerReason',
  sentimentScore: 'sentimentScore',
  whisperMessage: 'whisperMessage',
  briefingPayload: 'briefingPayload',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.DailyVoiceBriefingScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  briefingDate: 'briefingDate',
  totalCalls: 'totalCalls',
  missedCallsSaved: 'missedCallsSaved',
  leadsCaptured: 'leadsCaptured',
  appointmentsBooked: 'appointmentsBooked',
  ordersCreated: 'ordersCreated',
  revenueInfluenced: 'revenueInfluenced',
  laborHoursSaved: 'laborHoursSaved',
  topInquiries: 'topInquiries',
  unansweredFaqs: 'unansweredFaqs',
  actionItems: 'actionItems',
  deliveredVia: 'deliveredVia',
  createdAt: 'createdAt'
};

exports.Prisma.ActionAuditLogScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  callSessionId: 'callSessionId',
  turnIndex: 'turnIndex',
  customerSpeech: 'customerSpeech',
  detectedIntent: 'detectedIntent',
  confidence: 'confidence',
  toolName: 'toolName',
  toolArguments: 'toolArguments',
  toolResult: 'toolResult',
  policyCheck: 'policyCheck',
  policyReason: 'policyReason',
  agentUtterance: 'agentUtterance',
  latencyMs: 'latencyMs',
  createdAt: 'createdAt'
};

exports.Prisma.KnowledgeChunkScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  documentId: 'documentId',
  documentTitle: 'documentTitle',
  vaultId: 'vaultId',
  category: 'category',
  chunkIndex: 'chunkIndex',
  content: 'content',
  embedding: 'embedding',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentCategoryScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  color: 'color',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RagMemoryVaultScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  purposeDescription: 'purposeDescription',
  mode: 'mode',
  category: 'category',
  visibility: 'visibility',
  offeringsData: 'offeringsData',
  customerData: 'customerData',
  totalDocuments: 'totalDocuments',
  totalChunks: 'totalChunks',
  totalSizeBytes: 'totalSizeBytes',
  status: 'status',
  progressPercent: 'progressPercent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  title: 'title',
  documentType: 'documentType',
  fileUrl: 'fileUrl',
  fileSizeBytes: 'fileSizeBytes',
  mimeType: 'mimeType',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VaultDocumentItemScalarFieldEnum = {
  id: 'id',
  vaultId: 'vaultId',
  documentId: 'documentId',
  status: 'status',
  chunksCount: 'chunksCount',
  createdAt: 'createdAt'
};

exports.Prisma.VoiceAgentVaultLinkScalarFieldEnum = {
  id: 'id',
  voiceAgentId: 'voiceAgentId',
  vaultId: 'vaultId',
  createdAt: 'createdAt'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  allDay: 'allDay',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentRequestScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  voiceAgentId: 'voiceAgentId',
  voiceAgentName: 'voiceAgentName',
  callSessionId: 'callSessionId',
  type: 'type',
  priority: 'priority',
  status: 'status',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  customerEmail: 'customerEmail',
  topic: 'topic',
  requestedTimeRaw: 'requestedTimeRaw',
  scheduledStart: 'scheduledStart',
  scheduledEnd: 'scheduledEnd',
  locationOrPlatform: 'locationOrPlatform',
  notes: 'notes',
  calendarEventId: 'calendarEventId',
  resolvedById: 'resolvedById',
  resolvedAt: 'resolvedAt',
  resolutionNotes: 'resolutionNotes',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallCampaignRecipientScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  campaignId: 'campaignId',
  phoneNumber: 'phoneNumber',
  recipientName: 'recipientName',
  leadAttributes: 'leadAttributes',
  status: 'status',
  attemptCount: 'attemptCount',
  lastAttemptAt: 'lastAttemptAt',
  nextAttemptAt: 'nextAttemptAt',
  callSessionId: 'callSessionId',
  callOutcome: 'callOutcome',
  disconnectReason: 'disconnectReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  dueDate: 'dueDate',
  assignedToId: 'assignedToId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  Company: 'Company',
  User: 'User',
  VoiceAgent: 'VoiceAgent',
  PhoneNumber: 'PhoneNumber',
  CallCampaign: 'CallCampaign',
  CallSession: 'CallSession',
  CallTranscriptSegment: 'CallTranscriptSegment',
  CallToolExecution: 'CallToolExecution',
  VoiceWalletTransaction: 'VoiceWalletTransaction',
  DncRegistry: 'DncRegistry',
  ForwardingRule: 'ForwardingRule',
  CallQueue: 'CallQueue',
  VoiceAgentGuardrail: 'VoiceAgentGuardrail',
  VoiceAgentVersion: 'VoiceAgentVersion',
  IndustryTemplate: 'IndustryTemplate',
  CallEscalationEvent: 'CallEscalationEvent',
  DailyVoiceBriefing: 'DailyVoiceBriefing',
  ActionAuditLog: 'ActionAuditLog',
  KnowledgeChunk: 'KnowledgeChunk',
  DocumentCategory: 'DocumentCategory',
  RagMemoryVault: 'RagMemoryVault',
  Document: 'Document',
  VaultDocumentItem: 'VaultDocumentItem',
  VoiceAgentVaultLink: 'VoiceAgentVaultLink',
  CalendarEvent: 'CalendarEvent',
  AgentRequest: 'AgentRequest',
  CallCampaignRecipient: 'CallCampaignRecipient',
  Task: 'Task'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
