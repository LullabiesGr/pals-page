import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Inbox,
  LogOut,
  Mail,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/auth';
import { STATUS_LABELS, STATUS_COLORS, type SupportTicket, type TicketStatus } from '../lib/types';

const STATUS_OPTIONS: TicketStatus[] = ['new', 'in_progress', 'waiting_for_merchant', 'resolved', 'closed'];
type SortOrder = 'newest' | 'oldest';
type LoadState = 'loading' | 'loaded' | 'error';

export function AdminDashboardPage() {
  const { signOut, user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoadState('loading');
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setLoadState('error');
      setErrorMsg('Could not load tickets. Please try again.');
      return;
    }
    setTickets((data as SupportTicket[]) || []);
    setLoadState('loaded');
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filtered = useMemo(() => {
    let result = tickets;
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((t) =>
        [t.reference, t.name, t.email, t.store_url, t.subject, t.description]
          .some((v) => (v || '').toLowerCase().includes(q))
      );
    }
    if (sortOrder === 'oldest') {
      result = [...result].sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    return result;
  }, [tickets, search, statusFilter, sortOrder]);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    const { error } = await supabase.rpc('update_ticket_status', {
      p_ticket_id: ticketId,
      p_status: newStatus,
    });
    if (error) {
      setErrorMsg('Could not update ticket status.');
      return;
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    setSelectedTicket((prev) =>
      prev && prev.id === ticketId ? { ...prev, status: newStatus } : prev
    );
  };

  const copyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const getAttachmentUrl = async (path: string): Promise<void> => {
    const { data } = await supabase.storage.from('support-attachments').createSignedUrl(path, 600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener');
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedTicket) {
    return (
      <div className="admin-detail page-wrap">
        <button className="admin-back" onClick={() => setSelectedTicket(null)}>
          <ArrowLeft aria-hidden="true" /> Back to inbox
        </button>
        <div className="admin-detail-header">
          <div>
            <span className="eyebrow">TICKET {selectedTicket.reference}</span>
            <h1>{selectedTicket.subject || 'No subject'}</h1>
          </div>
          <button
            className="admin-copy-ref"
            onClick={() => copyReference(selectedTicket.reference)}
            aria-label="Copy reference number"
          >
            <Copy aria-hidden="true" />
            {copiedRef ? 'Copied!' : 'Copy ref'}
          </button>
        </div>

        <div className="admin-detail-grid">
          <div className="admin-detail-main">
            <div className="admin-detail-section">
              <h2>Description</h2>
              <p className="admin-description">{selectedTicket.description}</p>
            </div>

            {selectedTicket.attachment_path && (
              <div className="admin-detail-section">
                <h2>Attachment</h2>
                <button
                  className="admin-attachment-btn"
                  onClick={() => getAttachmentUrl(selectedTicket.attachment_path!)}
                >
                  <Download aria-hidden="true" />
                  View / download attachment
                </button>
              </div>
            )}

            <div className="admin-detail-section">
              <h2>Reply by email</h2>
              <a
                className="admin-reply-btn"
                href={`mailto:${selectedTicket.email}?subject=Re: [PALS Support] ${selectedTicket.reference} — ${selectedTicket.subject || 'Support request'}`}
              >
                <Mail aria-hidden="true" />
                Reply to {selectedTicket.name}
              </a>
            </div>
          </div>

          <aside className="admin-detail-side">
            <div className="admin-info-card">
              <h2>Ticket info</h2>
              <dl>
                <dt>Status</dt>
                <dd>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </dd>
                <dt>Merchant</dt>
                <dd>{selectedTicket.name}</dd>
                <dt>Email</dt>
                <dd>{selectedTicket.email}</dd>
                <dt>Store URL</dt>
                <dd>{selectedTicket.store_url}</dd>
                <dt>Theme</dt>
                <dd>{selectedTicket.theme_name}</dd>
                <dt>Created</dt>
                <dd>{formatDate(selectedTicket.created_at)}</dd>
                <dt>Updated</dt>
                <dd>{formatDate(selectedTicket.updated_at)}</dd>
                <dt>Admin email</dt>
                <dd>
                  <span className={`admin-email-badge ${selectedTicket.notification_status}`}>
                    {selectedTicket.notification_status}
                  </span>
                  {selectedTicket.notification_error && (
                    <small className="admin-error-text">{selectedTicket.notification_error}</small>
                  )}
                </dd>
                <dt>Merchant email</dt>
                <dd>
                  <span className={`admin-email-badge ${selectedTicket.autoresponder_status}`}>
                    {selectedTicket.autoresponder_status}
                  </span>
                  {selectedTicket.autoresponder_error && (
                    <small className="admin-error-text">{selectedTicket.autoresponder_error}</small>
                  )}
                </dd>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-inbox page-wrap">
      <div className="admin-inbox-header">
        <div>
          <span className="eyebrow">PALS ADMIN</span>
          <h1>Support Inbox</h1>
        </div>
        <div className="admin-user-area">
          {user?.email && <span className="admin-user-email">{user.email}</span>}
          <button className="admin-signout" onClick={signOut} aria-label="Sign out">
            <LogOut aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>

      <div className="admin-controls">
        <div className="admin-search-box">
          <Search aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by reference, name, email, subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {loadState === 'loading' && (
        <div className="admin-state" role="status" aria-live="polite">
          <div className="admin-spinner" aria-hidden="true" />
          <p>Loading tickets…</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className="admin-state admin-state-error" role="alert">
          <X aria-hidden="true" />
          <p>{errorMsg}</p>
          <button className="button button-blue" onClick={loadTickets}>Try again</button>
        </div>
      )}

      {loadState === 'loaded' && filtered.length === 0 && (
        <div className="admin-state admin-empty" role="status">
          <Inbox aria-hidden="true" />
          <p>{tickets.length === 0 ? 'No support tickets yet.' : 'No tickets match your filters.'}</p>
        </div>
      )}

      {loadState === 'loaded' && filtered.length > 0 && (
        <div className="admin-ticket-list" role="table" aria-label="Support tickets">
          <div className="admin-ticket-row admin-ticket-header" role="row">
            <span role="columnheader">Reference</span>
            <span role="columnheader">Merchant</span>
            <span role="columnheader">Subject</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Email</span>
            <span role="columnheader">Created</span>
            <span role="columnheader"></span>
          </div>
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              className="admin-ticket-row admin-ticket-data"
              role="row"
              onClick={() => setSelectedTicket(ticket)}
            >
              <span role="cell" className="admin-ticket-ref">{ticket.reference}</span>
              <span role="cell">
                <strong>{ticket.name}</strong>
                <small>{ticket.store_url}</small>
              </span>
              <span role="cell">{ticket.subject || '—'}</span>
              <span role="cell">
                <span
                  className="admin-status-badge"
                  style={{ background: STATUS_COLORS[ticket.status] }}
                >
                  {STATUS_LABELS[ticket.status]}
                </span>
              </span>
              <span role="cell">
                <span className={`admin-email-dot ${ticket.notification_status}`} title={`Admin: ${ticket.notification_status}`} />
                <span className={`admin-email-dot ${ticket.autoresponder_status}`} title={`Merchant: ${ticket.autoresponder_status}`} />
              </span>
              <span role="cell" className="admin-ticket-date">{formatDate(ticket.created_at)}</span>
              <span role="cell" className="admin-ticket-chevron"><ChevronRight aria-hidden="true" /></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
