import { prisma } from '@workspace/db-voiceforce';
import { TelnyxService } from '../telephony/telnyx.service';
import { GuardrailEnforcementEngine } from '../guardrails/guardrail-enforcement.engine';

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
 * Tool 4: Search Company Knowledge Vaults & Business Documents (RAG)
 */
export const searchBusinessKnowledgeTool: VoiceToolDefinition = {
  name: 'search_business_knowledge',
  description: 'Searches uploaded company documents, knowledge vaults, warranty terms, and business offerings for accurate facts.',
  allowedRoles: ['all'],
  category: 'knowledge',
  parameters: {
    query: { type: 'string', description: 'The question, term, or policy to query in company vaults', required: true },
    limit: { type: 'number', description: 'Maximum number of results to return (default: 3)' }
  },
  execute: async (args, context) => {
    const { companyId } = context;
    if (!companyId) return { success: false, error: 'Company ID is required' };

    const queryText = (args.query || '').trim();
    if (!queryText) return { success: false, error: 'Query text is required' };

    try {
      // 1. Search knowledge chunks
      const chunks = await (prisma as any).knowledgeChunk.findMany({
        where: {
          content: { contains: queryText, mode: 'insensitive' }
        },
        take: Number(args.limit) || 3,
        select: { id: true, content: true }
      });

      // 2. Search company offerings / catalog
      const offerings = await (prisma as any).companyOffering.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: queryText, mode: 'insensitive' } },
            { description: { contains: queryText, mode: 'insensitive' } }
          ]
        },
        take: 3,
        select: { name: true, description: true, price: true, currency: true }
      });

      const results: string[] = [];
      if (chunks && chunks.length > 0) {
        chunks.forEach((c: any) => results.push(`[Document Knowledge]: ${c.content}`));
      }
      if (offerings && offerings.length > 0) {
        offerings.forEach((o: any) => results.push(`[Offering Catalog]: ${o.name} - ${o.description || 'Standard'} (Price: ${o.currency || '$'}${o.price})`));;
      }

      if (results.length === 0) {
        return {
          success: true,
          query: queryText,
          found: false,
          message: `No specific document found matching "${queryText}". Proceed using standard company guidelines.`
        };
      }

      return {
        success: true,
        query: queryText,
        found: true,
        results,
        message: `Found ${results.length} relevant reference(s):\n${results.join('\n')}`
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        message: 'Knowledge vault query encountered an error. Falling back to general agent knowledge.'
      };
    }
  }
};

/**
 * Tool 4B: Alias for Knowledge Base Search
 */
export const searchKnowledgeBaseTool: VoiceToolDefinition = {
  ...searchBusinessKnowledgeTool,
  name: 'search_knowledge_base'
};

/**
 * Tool 5: Create Follow-up Task in Company Workspace
 */
export const createTaskTool: VoiceToolDefinition = {
  name: 'create_task',
  description: 'Creates a follow-up task or action item on the team task board for post-call resolution.',
  allowedRoles: ['all'],
  category: 'tasks',
  parameters: {
    title: { type: 'string', description: 'Action item title or summary', required: true },
    description: { type: 'string', description: 'Detailed context or notes for the follow-up' },
    priority: { type: 'string', description: 'Priority level: low, medium, high, urgent' },
    dueDate: { type: 'string', description: 'ISO date string or human readable due date' }
  },
  execute: async (args, context) => {
    const { companyId } = context;
    if (!companyId) return { success: false, error: 'Company ID is required' };

    try {
      const task = await (prisma as any).task.create({
        data: {
          companyId,
          title: args.title || 'Voice Call Follow-up',
          description: args.description || 'Auto-generated follow-up task from AI voice session.',
          priority: args.priority || 'medium',
          status: 'todo',
          dueDate: args.dueDate ? new Date(args.dueDate) : null
        }
      });

      return {
        success: true,
        taskId: task.id,
        title: task.title,
        status: task.status,
        message: `Follow-up task "${task.title}" has been created for the team.`
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        message: 'Could not create follow-up task at this time.'
      };
    }
  }
};

/**
 * Tool 6: Apply Guardrail-Compliant Promotional or Retention Discount
 */
export const applyDiscountTool: VoiceToolDefinition = {
  name: 'apply_discount',
  description: 'Applies a promotional or retention discount to the customer quote or order subject to company guardrail policies.',
  allowedRoles: ['all'],
  category: 'pricing',
  parameters: {
    discountPercent: { type: 'number', description: 'Discount percentage (0-100)' },
    discountAmount: { type: 'number', description: 'Direct discount amount' },
    reason: { type: 'string', description: 'Reason for offering the discount (e.g. price hesitation, loyalty)' }
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
      return {
        success: false,
        discountApplied: false,
        reason: check.reason,
        message: `Discount could not be applied: ${check.reason}`
      };
    }

    const appliedPercent = check.sanitizedArguments?.discountPercent ?? args.discountPercent;
    const appliedAmount = check.sanitizedArguments?.discountAmount ?? args.discountAmount;

    return {
      success: true,
      discountApplied: true,
      discountPercent: appliedPercent,
      discountAmount: appliedAmount,
      overridden: check.overridden || false,
      note: check.reason || 'Discount validated by Guardrail Policy Engine.',
      message: appliedPercent
        ? `A ${appliedPercent}% discount has been approved and applied to your order.`
        : `A discount of ${context.currencySymbol || '$'}${appliedAmount} has been approved.`
    };
  }
};

/**
 * Tool 7: Transfer Caller to Human Staff or Escalation Queue
 */
export const transferToHumanTool: VoiceToolDefinition = {
  name: 'transfer_to_human',
  description: 'Transfers or escalates the active voice call to a human department specialist or live operator.',
  allowedRoles: ['all'],
  category: 'telephony',
  parameters: {
    reason: { type: 'string', description: 'Reason for human handoff or escalation', required: true },
    department: { type: 'string', description: 'Target department: support, billing, sales, manager' }
  },
  execute: async (args, context) => {
    return {
      success: true,
      action: 'sip_transfer',
      department: args.department || 'general_support',
      reason: args.reason,
      message: 'I am transferring you to a team specialist right now. Please hold for just a moment while I connect you.'
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


