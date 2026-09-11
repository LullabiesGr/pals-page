export type TicketStatus = 'new' | 'in_progress' | 'waiting_for_merchant' | 'resolved' | 'closed';

export type SupportTicket = {
  id: string;
  reference: string;
  name: string;
  email: string;
  store_url: string;
  theme_name: string;
  subject: string | null;
  description: string;
  status: TicketStatus;
  attachment_path: string | null;
  notification_status: string;
  autoresponder_status: string;
  notification_error: string | null;
  autoresponder_error: string | null;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  waiting_for_merchant: 'Waiting for Merchant',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  new: 'var(--lime)',
  in_progress: 'var(--blue)',
  waiting_for_merchant: 'var(--yellow)',
  resolved: '#b9e769',
  closed: 'var(--muted)',
};
