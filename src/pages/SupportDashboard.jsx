import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase/firebaseService';

const formatDate = (value) => {
  if (!value) return 'No date available';
  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'No date available' : parsed.toLocaleString();
};

const getTicketTitle = (ticket) =>
  ticket.title || ticket.subject || ticket.issueTitle || 'No Subject';

const getTicketCategory = (ticket) =>
  ticket.category || ticket.type || ticket.topic || 'Uncategorized';

const getTicketStatus = (ticket) =>
  (ticket.status || 'open').toString().toLowerCase();

const isTicketSpam = (ticket) => ticket.isSpam === true;

const getTicketSubmitter = (ticket) =>
  ticket.name ||
  ticket.fullName ||
  ticket.createdBy?.displayName ||
  ticket.createdBy?.name ||
  ticket.createdBy?.fullName ||
  ticket.email ||
  ticket.createdBy?.email ||
  getTicketUsername(ticket) ||
  'Unknown User';

const getTicketUsername = (ticket) =>
  ticket.username ||
  ticket.userName ||
  ticket.handle ||
  ticket.submittedByUsername ||
  ticket.createdBy?.username ||
  ticket.createdBy?.userName ||
  ticket.createdBy?.handle ||
  ticket.createdBy?.submittedByUsername ||
  null;

const getTicketPreview = (ticket) =>
  ticket.message || ticket.description || ticket.details || 'No message provided.';

const getMessageBody = (message) =>
  message.text || message.message || message.body || message.content || '';

const getMessageSender = (message) =>
  message.senderName ||
  message.createdBy?.displayName ||
  message.createdBy?.name ||
  message.email ||
  message.createdBy?.email ||
  'Unknown Sender';

const statusButtonClass = (isActive) =>
  isActive
    ? 'bg-purple-600 text-white border-purple-500'
    : 'bg-card text-primary border-primary hover:border-purple-400 hover:text-primary';

const SupportDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [messagesByTicket, setMessagesByTicket] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [spamFilter, setSpamFilter] = useState('active');
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);

  const fetchMessages = async (ticketId, showLoader = false) => {
    if (!ticketId) return;

    if (showLoader) {
      setRefreshingMessages(true);
    }

    try {
      const messagesRef = collection(db, 'support_tickets', ticketId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(messagesQuery);
      const messages = snapshot.docs.map((messageDoc) => ({
        id: messageDoc.id,
        ...messageDoc.data(),
      }));

      setMessagesByTicket((prev) => ({
        ...prev,
        [ticketId]: messages,
      }));
    } catch (err) {
      console.error('Error loading ticket messages:', err);
      setError(err);
    } finally {
      if (showLoader) {
        setRefreshingMessages(false);
      }
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const ticketsRef = collection(db, 'support_tickets');
        const ticketsQuery = query(ticketsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(ticketsQuery);

        const ticketsData = snapshot.docs
          .map((ticketDoc) => ({
            id: ticketDoc.id,
            ...ticketDoc.data(),
          }))
          .filter((ticket) => ticket.deleted !== true);

        setTickets(ticketsData);
      } catch (err) {
        console.error('Error loading support tickets:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const categories = useMemo(() => {
    const values = new Set();
    tickets.forEach((ticket) => values.add(getTicketCategory(ticket)));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [tickets]);

  useEffect(() => {
    if (hasInitializedFilters || tickets.length === 0) {
      return;
    }

    setSpamFilter('active');
    setStatusFilter('all');
    setHasInitializedFilters(true);
  }, [tickets, hasInitializedFilters]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === 'all' || getTicketStatus(ticket) === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || getTicketCategory(ticket) === categoryFilter;
      const matchesSpam =
        spamFilter === 'all' ||
        (spamFilter === 'spam' && isTicketSpam(ticket)) ||
        (spamFilter === 'active' && !isTicketSpam(ticket) && getTicketStatus(ticket) !== 'closed') ||
        (spamFilter === 'closed' && !isTicketSpam(ticket) && getTicketStatus(ticket) === 'closed');

      if (!matchesStatus || !matchesCategory || !matchesSpam) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        getTicketTitle(ticket),
        getTicketCategory(ticket),
        getTicketSubmitter(ticket),
        getTicketUsername(ticket) || '',
        getTicketPreview(ticket),
        ticket.email || '',
        ticket.createdBy?.email || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [tickets, statusFilter, categoryFilter, spamFilter, searchTerm]);

  useEffect(() => {
    if (!hasInitializedFilters) {
      return;
    }

    if (filteredTickets.length === 0) {
      setSelectedTicketId(null);
      return;
    }

    const selectedStillVisible = filteredTickets.some((ticket) => ticket.id === selectedTicketId);
    if (!selectedStillVisible) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId, hasInitializedFilters]);

  useEffect(() => {
    if (selectedTicketId && !messagesByTicket[selectedTicketId]) {
      fetchMessages(selectedTicketId, true);
    }
  }, [selectedTicketId, messagesByTicket]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const selectedMessages = selectedTicketId ? messagesByTicket[selectedTicketId] || [] : [];

  const updateTicketStatus = async (ticketId, nextStatus) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: nextStatus,
              }
            : ticket
        )
      );
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError(err);
    }
  };

  const updateTicketSpamStatus = async (ticketId, nextSpamValue) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        isSpam: nextSpamValue,
        updatedAt: serverTimestamp(),
      });

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                isSpam: nextSpamValue,
              }
            : ticket
        )
      );
    } catch (err) {
      console.error('Error updating spam status:', err);
      setError(err);
    }
  };

  const deleteTicket = async (ticketId) => {
    const ticketToDelete = tickets.find((ticket) => ticket.id === ticketId);

    if (!ticketToDelete || !isTicketSpam(ticketToDelete)) {
      return;
    }

    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTickets((current) => current.filter((ticket) => ticket.id !== ticketId));
      setMessagesByTicket((current) => {
        const next = { ...current };
        delete next[ticketId];
        return next;
      });
      setSelectedTicketId((current) => (current === ticketId ? null : current));
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError(err);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) {
      return;
    }

    setReplying(true);

    try {
      const messagesRef = collection(db, 'support_tickets', selectedTicket.id, 'messages');
      await addDoc(messagesRef, {
        text: replyText.trim(),
        senderName: user?.displayName || user?.email || 'Admin',
        senderId: user?.uid || null,
        senderRole: 'admin',
        email: user?.email || null,
        createdAt: serverTimestamp(),
      });

      await updateTicketStatus(selectedTicket.id, 'open');
      setReplyText('');
      await fetchMessages(selectedTicket.id, true);
    } catch (err) {
      console.error('Error sending reply:', err);
      setError(err);
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content md:ml-[76px] md:w-[calc(100%_-_76px)] overflow-x-hidden">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Loading support tickets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content md:ml-[76px] md:w-[calc(100%_-_76px)] overflow-x-hidden">
        <div className="flex items-center justify-center min-h-[400px] px-6">
          <div className="text-red-500 text-center">
            Error loading support tickets: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content md:ml-[76px] md:w-[calc(100%_-_76px)] overflow-x-hidden">
      <div className="relative w-full max-w-7xl mx-auto space-y-10 mb-10 px-4 sm:px-6 lg:px-8">
        <section className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between sm:text-left">
            <div className="space-y-2">
              <h1 className="dashboard-title text-5xl font-extrabold tracking-tight drop-shadow sm:text-6xl text-gradient-primary">
                Admin Dashboard
              </h1>
              <p className="dashboard-subtitle text-lg text-secondary">
                View, filter, and respond to support tickets submitted by users.
              </p>
            </div>

            <Link
              to="/profile"
              className="card inline-flex shrink-0 items-center justify-center bg-purple-600 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Back to Profile
            </Link>
          </div>
        </section>

        <div className="card w-full max-w-full overflow-hidden space-y-6 border border-primary bg-card text-primary shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Support Tickets</h2>
              <p className="mt-1 text-sm text-secondary">
                Total Tickets: {filteredTickets.length}
                {filteredTickets.length !== tickets.length ? ` of ${tickets.length}` : ''}
              </p>
            </div>

            <div className="grid w-full max-w-full gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:max-w-[900px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title, user, email, or message"
                className="rounded-xl border border-primary bg-card px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-primary bg-card px-4 py-3 text-sm text-primary outline-none transition shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="in progress">In Progress</option>
              </select>

              <select
                value={spamFilter}
                onChange={(event) => setSpamFilter(event.target.value)}
                className="rounded-xl border border-primary bg-card px-4 py-3 text-sm text-primary outline-none transition shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
              >
                <option value="all">All Tickets</option>
                <option value="active">Active Tickets</option>
                <option value="closed">Closed Tickets</option>
                <option value="spam">Spam Tickets</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-primary bg-card px-4 py-3 text-sm text-primary outline-none transition shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              No support tickets match the current filters.
            </div>
          ) : (
            <div className="grid max-w-full gap-6 xl:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
              <div className="space-y-4 max-h-[900px] overflow-y-auto pr-1">
                {filteredTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;
                  const ticketStatus = getTicketStatus(ticket);
                  const ticketCategory = getTicketCategory(ticket);

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full rounded-xl border p-5 text-left transition ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                          : 'border-primary bg-card shadow-sm hover:border-purple-400 hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {getTicketTitle(ticket)}
                          </h3>
                          <div className="space-y-1">
                            <p className="truncate text-sm text-secondary">
                              {getTicketSubmitter(ticket)}
                            </p>
                            {getTicketUsername(ticket) && (
                              <p className="text-xs text-purple-300 truncate">
                                @{getTicketUsername(ticket)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              ticketStatus === 'closed'
                                ? 'bg-white/10 text-white'
                                : ticketStatus === 'in progress'
                                  ? 'bg-blue-500/20 text-blue-200'
                                  : 'bg-purple-600 text-white'
                            }`}
                          >
                            {ticketStatus}
                          </span>
                          {isTicketSpam(ticket) && (
                            <span className="inline-flex shrink-0 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200">
                              Spam
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full border border-primary px-3 py-1 text-xs text-secondary bg-[var(--bg-secondary)]">
                          {ticketCategory}
                        </span>
                        <span className="inline-flex rounded-full border border-primary px-3 py-1 text-xs text-secondary bg-[var(--bg-secondary)]">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-secondary line-clamp-3">
                        {getTicketPreview(ticket)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedTicket ? (
                <div className="rounded-2xl border border-primary bg-card p-6 space-y-6 text-primary shadow-lg min-w-0">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-bold break-words">
                          {getTicketTitle(selectedTicket)}
                        </h3>
                        <span className="inline-flex rounded-full border border-primary bg-[var(--bg-secondary)] px-3 py-1 text-xs text-secondary">
                          {getTicketCategory(selectedTicket)}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-secondary">
                        <p>Submitted by: {getTicketSubmitter(selectedTicket)}</p>
                        {getTicketUsername(selectedTicket) && (
                          <p>Username: @{getTicketUsername(selectedTicket)}</p>
                        )}
                        {(selectedTicket.email || selectedTicket.createdBy?.email) && (
                          <p>Email: {selectedTicket.email || selectedTicket.createdBy?.email}</p>
                        )}
                        <p>Created: {formatDate(selectedTicket.createdAt)}</p>
                        <p>Updated: {formatDate(selectedTicket.updatedAt || selectedTicket.createdAt)}</p>
                        <p>
                          Ticket Category:{' '}
                          <span className={isTicketSpam(selectedTicket) ? 'text-red-300 font-semibold' : 'text-green-300 font-semibold'}>
                            {isTicketSpam(selectedTicket) ? 'Spam Ticket' : 'Active Ticket'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(selectedTicket.id, 'open')}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${statusButtonClass(
                          getTicketStatus(selectedTicket) === 'open'
                        )}`}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(selectedTicket.id, 'in progress')}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${statusButtonClass(
                          getTicketStatus(selectedTicket) === 'in progress'
                        )}`}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${statusButtonClass(
                          getTicketStatus(selectedTicket) === 'closed'
                        )}`}
                      >
                        Closed
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTicketSpamStatus(selectedTicket.id, true)}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          isTicketSpam(selectedTicket)
                            ? 'border-red-400 bg-red-500/20 text-red-600'
                            : 'border-primary bg-card text-primary hover:border-red-400 hover:text-red-600 hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        Mark Spam
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTicketSpamStatus(selectedTicket.id, false)}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          !isTicketSpam(selectedTicket)
                            ? 'border-green-400 text-green-300 bg-transparent'
                            : 'border-primary bg-card text-primary hover:border-green-400 hover:text-green-700 hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        Not Spam
                      </button>
                      {isTicketSpam(selectedTicket) && (
                        <button
                          type="button"
                          onClick={() => deleteTicket(selectedTicket.id)}
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                        >
                          Delete Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm font-medium mb-2">Original Issue</p>
                    <p className="whitespace-pre-wrap text-primary">
                      {getTicketPreview(selectedTicket)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-xl font-semibold">Conversation</h4>
                      <button
                        type="button"
                        onClick={() => fetchMessages(selectedTicket.id, true)}
                        className="rounded-xl border border-primary bg-card px-4 py-2 text-sm font-semibold text-primary transition hover:border-purple-400 hover:bg-[var(--bg-secondary)]"
                      >
                        {refreshingMessages ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto space-y-3 rounded-xl border border-primary bg-[var(--bg-secondary)] p-4">
                      {selectedMessages.length === 0 ? (
                        <div className="text-sm text-secondary">
                          No chat messages yet for this ticket.
                        </div>
                      ) : (
                        selectedMessages.map((message) => {
                          const isAdminMessage = message.senderRole === 'admin';

                          return (
                            <div
                              key={message.id}
                              className={`rounded-xl p-4 ${
                                isAdminMessage
                                  ? 'border border-purple-500/30 bg-purple-500/10'
                                  : 'border border-primary bg-card'
                              }`}
                            >
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-semibold">
                                  {getMessageSender(message)}
                                  {isAdminMessage ? ' • Admin' : ''}
                                </p>
                                <p className="text-xs text-secondary">
                                  {formatDate(message.createdAt)}
                                </p>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-primary">
                                {getMessageBody(message) || 'No message content.'}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-primary">Reply to Ticket</label>
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      rows={5}
                      placeholder="Type your response here..."
                      className="w-full rounded-xl border border-primary bg-card px-4 py-3 text-sm text-primary outline-none transition placeholder:text-secondary focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={replying || !replyText.trim()}
                        className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {replying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-primary bg-card p-10 text-center text-secondary shadow-lg">
                  Select a ticket to view its issue details and conversation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;