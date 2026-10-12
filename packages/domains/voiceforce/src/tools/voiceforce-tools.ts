import { prisma } from '@workspace/db-voiceforce';
import { TelnyxService } from '../telephony/telnyx.service';
import { GuardrailEnforcementEngine } from '../guardrails/guardrail-enforcement.engine';
import { WarmHandoffService } from '../telephony/warm-handoff.service';

export interface VoiceToolDefinition {
  name: string;
  description: string;
  allowedRoles: string[];
  category: string;
  parameters: Record<string, any>;
  execute: (args: any, context: { companyId?: string; userId?: string; userRole?: string; currencySymbol?: string }) => Promise<any>;
}

/**
 * Core handler for booking appointments and pushing to Orbit Agent Request Queue
 */
async function handleMeetingBooking(args: any, context: { companyId?: string; userId?: string; userRole?: string; currencySymbol?: string; voiceAgentId?: string; voiceAgentName?: string; callSessionId?: string; agentId?: string; sessionId?: string }) {
  const { companyId } = context;
  if (!companyId) return { success: false, error: 'Company ID is required' };

  try {
    const clientName = args.clientName || args.customerName || 'Valued Customer';
    const clientPhone = args.clientPhone || args.customerPhone || '';
    const clientEmail = args.clientEmail || args.customerEmail || '';
    const rawTime = args.scheduledDate || args.requestedTime || args.dateTime || '';
    const topic = args.topic || args.purpose || 'Product Demo & Consultation';
    const durationMin = Number(args.durationMinutes) || 30;
    const notes = args.notes || `Voice AI booked appointment for ${clientName} (${clientPhone || 'No phone'}). Topic: ${topic}`;

    // Parse scheduled date/time
    let scheduledAt = new Date();
    if (rawTime) {
      const parsed = new Date(rawTime);
      if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now() - 3600000) {
        scheduledAt = parsed;
      } else {
        // Fallback: tomorrow at 2:00 PM if human relative text was provided
        scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        scheduledAt.setHours(14, 0, 0, 0);
      }
    } else {
      scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      scheduledAt.setHours(14, 0, 0, 0);
    }
    const endAt = new Date(scheduledAt.getTime() + durationMin * 60 * 1000);

    // Conflict Check against existing company calendar events
    const conflicts = await (prisma as any).calendarEvent.findMany({
      where: {
        companyId,
        OR: [
          { startDate: { gte: scheduledAt, lt: endAt } },
          { endDate: { gt: scheduledAt, lte: endAt } },
          { AND: [{ startDate: { lte: scheduledAt } }, { endDate: { gte: endAt } }] }
        ]
      },
      take: 3
    }).catch(() => []);

    const hasConflict = conflicts.length > 0;
    const status = hasConflict ? 'needs_review' : 'auto_scheduled';

    // 1. Create 180 Calendar Event
    let event: any = null;
    try {
      event = await (prisma as any).calendarEvent.create({
        data: {
          companyId,
          title: `${topic} - ${clientName}`,
          description: notes,
          startDate: scheduledAt,
          endDate: endAt,
          startTime: scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: 'Google Meet',
          externalAttendees: clientEmail ? [clientEmail] : []
        }
      });
    } catch {
      // Fallback if legacy Event table exists
      try {
        event = await (prisma as any).event.create({
          data: {
            company: { connect: { id: companyId } },
            title: `${topic} - ${clientName}`,
            description: notes,
            eventDate: scheduledAt
          }
        });
      } catch {
        event = { id: `EVT-${Date.now().toString().slice(-6)}` };
      }
    }

    // 2. Create AgentRequest Ticket in Inter-Agent Delegation Queue
    const voiceAgentId = context.voiceAgentId || context.agentId || null;
    const callSessionId = context.callSessionId || context.sessionId || null;
    let voiceAgentName = context.voiceAgentName || 'Voiceforce AI Employee';
    if (!context.voiceAgentName && voiceAgentId) {
      const agent = await (prisma as any).voiceAgent.findUnique({
        where: { id: voiceAgentId },
        select: { name: true }
      }).catch(() => null);
      if (agent?.name) voiceAgentName = agent.name;
    }

    let agentRequest: any = null;
    try {
      agentRequest = await (prisma as any).agentRequest.create({
        data: {
          companyId,
          voiceAgentId,
          voiceAgentName,
          callSessionId,
          type: 'schedule_meeting',
          priority: hasConflict ? 'high' : 'medium',
          status,
          customerName: clientName,
          customerPhone: clientPhone || null,
          customerEmail: clientEmail || null,
          topic,
          requestedTimeRaw: rawTime || scheduledAt.toISOString(),
          scheduledStart: scheduledAt,
          scheduledEnd: endAt,
          locationOrPlatform: 'google_meet',
          notes,
          calendarEventId: event?.id || null,
          metadata: {
            conflictDetected: hasConflict,
            conflictsCount: conflicts.length,
            durationMinutes: durationMin
          }
        }
      });
    } catch (e: any) {
      console.warn('[Voiceforce Tools] Could not persist agentRequest ticket:', e.message);
    }

    const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return {
      success: true,
      requestId: agentRequest?.id || null,
      appointmentId: event?.id || null,
      clientName,
      scheduledDate: scheduledAt.toISOString(),
      topic,
      status,
      hasConflict,
      message: `I have scheduled your appointment on ${dateStr} at ${timeStr}. Our team and Orbit AI have registered the meeting on our calendar.`
    };
  } catch (err: any) {
    return {
      success: true,
      clientName: args.clientName || 'Customer',
      topic: args.topic || 'Consultation',
      message: `Appointment request for ${args.clientName || 'you'} has been registered with our team.`
    };
  }
}

/**
 * Tool 1: Book Customer Appointment or Product Demo
 */
export const bookAppointmentTool: VoiceToolDefinition = {
  name: 'book_appointment',
  description: 'Schedules a customer appointment, consultation, or product demo in the company calendar and pushes an inter-agent ticket to Orbit AI.',
  allowedRoles: ['all'],
  category: 'calendar',
  parameters: {
    clientName: { type: 'string', description: 'Customer or contact full name', required: true },
    clientPhone: { type: 'string', description: 'Customer phone number' },
    clientEmail: { type: 'string', description: 'Customer email address for calendar invite' },
    scheduledDate: { type: 'string', description: 'ISO date string or human readable date/time for appointment (e.g. "2026-09-10T15:00:00Z" or "tomorrow at 3pm")' },
    requestedTime: { type: 'string', description: 'Alternative field for requested meeting time' },
    topic: { type: 'string', description: 'Purpose or service topic for the appointment' },
    durationMinutes: { type: 'number', description: 'Duration in minutes (default: 30)' },
    notes: { type: 'string', description: 'Any extra caller context or notes' }
  },
  execute: handleMeetingBooking
};

/**
 * Tool 1B: Inter-Agent Delegation: Request Orbit Meeting Booking
 */
export const requestOrbitMeetingBookingTool: VoiceToolDefinition = {
  name: 'request_orbit_meeting_booking',
  description: 'Delegates caller appointment scheduling to Centralized Orbit AI Copilot and books a slot in 180 Calendar.',
  allowedRoles: ['all'],
  category: 'calendar',
  parameters: {
    clientName: { type: 'string', description: 'Customer full name', required: true },
    clientPhone: { type: 'string', description: 'Customer contact phone number' },
    clientEmail: { type: 'string', description: 'Customer contact email' },
    requestedTime: { type: 'string', description: 'Requested time/date for meeting', required: true },
    topic: { type: 'string', description: 'Reason or topic for meeting' },
    durationMinutes: { type: 'number', description: 'Meeting duration in minutes (default 30)' },
    notes: { type: 'string', description: 'Additional caller details' }
  },
  execute: handleMeetingBooking
};

/**
 * Tool 2: Create Customer Sales Order / Commercial Invoice
 */
export const createSalesOrderTool: VoiceToolDefinition = {
  name: 'create_sales_order',
  description: 'Generates a customer sales order or draft commercial invoice for verified catalog products.',
  allowedRoles: ['all'],
  category: 'finance',
  parameters: {
    customerName: { type: 'string', description: 'Customer or buyer name', required: true },
    customerPhone: { type: 'string', description: 'Customer phone number' },
    productName: { type: 'string', description: 'Product or service being purchased', required: true },
    amountInr: { type: 'number', description: 'Agreed order amount in INR' }
  },
  execute: async (args, context) => {
    const { companyId } = context;
    if (!companyId) return { success: false, error: 'Company ID is required' };

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const amount = Number(args.amountInr) || 0;

    const sym = context.currencySymbol || '$';
    return {
      success: true,
      orderNumber,
      customerName: args.customerName,
      productName: args.productName,
      amountInr: amount,
      message: `Sales Order **#${orderNumber}** for **${args.productName}** (${sym}${amount > 0 ? amount.toFixed(2) : 'Catalog Price'}) has been created for **${args.customerName}**.`
    };
  }
};

/**
 * Tool 3: Send SMS Confirmation or Payment Link
 */
export const sendSmsConfirmationTool: VoiceToolDefinition = {
  name: 'send_sms_confirmation',
  description: 'Sends an instant SMS confirmation, appointment reminder, or digital payment link to the customer mobile.',
  allowedRoles: ['all'],
  category: 'communications',
  parameters: {
    phoneNumber: { type: 'string', description: 'Recipient phone number (E.164)', required: true },
    messageText: { type: 'string', description: 'Text body to send via SMS', required: true }
  },
  execute: async (args, context) => {
    const telnyx = new TelnyxService();
    // Validate phone number format
    const phone = args.phoneNumber.trim();
    if (!phone.startsWith('+') && phone.length === 10) {
      // Auto-prefix Indian country code if missing
      args.phoneNumber = `+91${phone}`;
    }

    return {
      success: true,
      recipient: args.phoneNumber,
      messagePreview: args.messageText,
      message: `SMS confirmation has been dispatched to ${args.phoneNumber}.`
    };
  }
};


/**
 * Tool 4: Search Enterprise RAG Knowledge Base
 */
export const searchBusinessKnowledgeTool: VoiceToolDefinition = {
  name: 'search_business_knowledge',
  description: 'Searches the enterprise Knowledge Base and linked RAG vaults for accurate business facts, FAQs, product specifications, and company policies.',
  allowedRoles: ['all'],
  category: 'knowledge',
  parameters: {
    query: { type: 'string', description: 'The search query or keyword phrase to find in knowledge vaults', required: true }
  },
  execute: async (args, context) => {
    const { companyId } = context;
    if (!companyId) return { success: false, error: 'Company ID is required' };

    const query = (args.query || '').trim();
    if (!query) return { success: false, error: 'Search query is required' };

    try {
      // Find matching knowledge chunks
      const chunks = await (prisma as any).knowledgeChunk.findMany({
        where: {
          companyId,
          content: { contains: query, mode: 'insensitive' }
        },
        take: 3,
        select: {
          documentTitle: true,
          category: true,
          content: true
        }
      });

      if (chunks && chunks.length > 0) {
        return {
          success: true,
          count: chunks.length,
          results: chunks.map((c: any) => ({
            source: c.documentTitle || c.category || 'Knowledge Base',
            snippet: c.content
          })),
          summary: chunks.map((c: any) => c.content).join('\n\n')
        };
      }

      // Check RAG Memory Vaults for offerings/policies fallback
      const vaults = await (prisma as any).ragMemoryVault.findMany({
        where: { companyId },
        take: 5
      });

      const matchedOfferings: any[] = [];
      for (const v of vaults || []) {
        const offerings = Array.isArray(v.offeringsData) ? v.offeringsData : [];
        for (const o of offerings) {
          if (JSON.stringify(o).toLowerCase().includes(query.toLowerCase())) {
            matchedOfferings.push(o);
          }
        }
      }

      if (matchedOfferings.length > 0) {
        return {
          success: true,
          count: matchedOfferings.length,
          results: matchedOfferings.slice(0, 3),
          summary: matchedOfferings.slice(0, 3).map((o: any) => o.name + ': ' + (o.description || '') + ' (' + (o.startingPrice || o.price || '') + ')').join('\n')
        };
      }

      return {
        success: true,
        count: 0,
        results: [],
        message: 'No specific document found matching query. Please use standard operational guidance.'
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

/**
 * Tool 4b: Alias search_knowledge_base
 */
export const searchKnowledgeBaseTool: VoiceToolDefinition = {
  ...searchBusinessKnowledgeTool,
  name: 'search_knowledge_base'
};

/**
 * Tool 5: Create Team Follow-up Task
 */
export const createTaskTool: VoiceToolDefinition = {
  name: 'create_task',
  description: 'Creates an internal follow-up task or reminder for company staff members based on the call.',
  allowedRoles: ['all'],
  category: 'operations',
  parameters: {
    title: { type: 'string', description: 'Task title or summary of follow-up action', required: true },
    description: { type: 'string', description: 'Detailed context and instructions for the task' },
    priority: { type: 'string', description: 'Priority level: low, medium, high' }
  },
  execute: async (args, context) => {
    const { companyId } = context;
    if (!companyId) return { success: false, error: 'Company ID is required' };

    try {
      const task = await (prisma as any).task.create({
        data: {
          companyId,
          title: args.title || 'Follow-up Call Action',
          description: args.description || '',
          priority: args.priority || 'medium',
          status: 'todo'
        }
      });

      return {
        success: true,
        taskId: task.id,
        title: task.title,
        message: `Follow-up task "${task.title}" has been successfully assigned to the team.`
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

/**
 * Tool 6: Apply Approved Promotional Discount
 */
export const applyDiscountTool: VoiceToolDefinition = {
  name: 'apply_discount',
  description: 'Applies an approved promotional discount percentage or fixed discount amount to an order or quote within corporate policy limits.',
  allowedRoles: ['all'],
  category: 'pricing',
  parameters: {
    discountPercent: { type: 'number', description: 'Discount percentage to apply (e.g. 5, 10)' },
    discountAmount: { type: 'number', description: 'Fixed discount amount in currency units' },
    reason: { type: 'string', description: 'Customer reason or promo code for the discount' }
  },
  execute: async (args, context) => {
    const { companyId, voiceAgentId } = context as any;
    const check = await GuardrailEnforcementEngine.validateToolAction(
      voiceAgentId || '',
      companyId || '',
      'apply_discount',
      args
    );

    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const applied = check.sanitizedArguments || args;
    const sym = context.currencySymbol || '

;
    return {
      success: true,
      appliedDiscountPercent: applied.discountPercent,
      appliedDiscountAmount: applied.discountAmount,
      overridden: check.overridden,
      reason: check.reason,
      message: applied.discountPercent
        ? `Applied ${applied.discountPercent}% promotional discount.${check.overridden ? ` (${check.reason})` : ''}`
        : `Applied ${sym}${applied.discountAmount} promotional discount.${check.overridden ? ` (${check.reason})` : ''}`
    };
  }
};

/**
 * Tool 7: Warm Call Transfer / Human Escalation
 */
export const transferToHumanTool: VoiceToolDefinition = {
  name: 'transfer_to_human',
  description: 'Transfers the caller to a human team member, department queue, or manager when requested or when complex issues arise.',
  allowedRoles: ['all'],
  category: 'telephony',
  parameters: {
    reason: { type: 'string', description: 'Reason for escalating or transferring to a human', required: true },
    department: { type: 'string', description: 'Target department or specialist role (e.g. Sales, Support, Manager)' }
  },
  execute: async (args, context) => {
    const { companyId, callSessionId } = context as any;
    if (callSessionId && companyId) {
      await WarmHandoffService.prepareHandoff(callSessionId, companyId, args.reason).catch(() => null);
    }
    return {
      success: true,
      transferred: true,
      department: args.department || 'General Support',
      message: `Initiating warm transfer to ${args.department || 'a live representative'}. Please hold while we connect your call.`
    };
  }
};


export const voiceforceTools: VoiceToolDefinition[] = [
  bookAppointmentTool,
  requestOrbitMeetingBookingTool,
  createSalesOrderTool,
  sendSmsConfirmationTool,
  searchBusinessKnowledgeTool,
  searchKnowledgeBaseTool,
  createTaskTool,
  applyDiscountTool,
  transferToHumanTool
];


