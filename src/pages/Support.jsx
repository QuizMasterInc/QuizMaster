import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const CATEGORY_OPTIONS = [
  "General Issue",
  "Account Issue",
  "Report a User",
  "Share Your Experience",
];

const getTicketStatusValue = (data = {}) => {
  if (typeof data.status === "string" && data.status.trim()) {
    return data.status.trim().toLowerCase();
  }

  if (typeof data.still_open === "boolean") {
    return data.still_open ? "open" : "closed";
  }

  return "open";
};

const getTicketStatusLabel = (status) => {
  if (status === "closed") return "Closed";
  if (status === "in progress") return "In Progress";
  return "Awaiting Response";
};

function TicketCard({ ticket, onOpen }) {
  return (
    <div className="bg-card border border-accent rounded-2xl p-5 shadow-xl transition-transform duration-200 hover:-translate-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent bg-[rgba(168,85,247,0.12)]">
          {ticket.category}
        </span>
        <span className="text-xs text-secondary">{ticket.statusLabel}</span>
      </div>

      <h3 className="text-xl font-bold text-primary font-main mb-2">
        {ticket.title}
      </h3>
      <p className="text-sm text-secondary leading-6">{ticket.description}</p>

      <div className="mt-4 flex flex-col gap-1">
        <span className="text-xs text-secondary">
          Updated {ticket.updatedAt}
        </span>
        {ticket.lastMessageSenderName ? (
          <span className="text-xs text-secondary">
            Last message by{" "}
            <span className="font-semibold text-primary">
              {ticket.lastMessageSenderName}
            </span>
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onOpen(ticket)}
          className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7c3aed,#a855f7)] text-white font-semibold shadow-md hover:opacity-90 transition"
        >
          Open Ticket
        </button>
      </div>
    </div>
  );
}

function TicketConversation({
  ticket,
  onClose,
  onRefresh,
  isRefreshing,
  replyText,
  onReplyChange,
  onSendReply,
  isSendingReply,
}) {
  if (!ticket) return null;

  const isClosed = ticket.status === "closed";

  return (
    <section className="bg-card border border-accent rounded-3xl p-6 sm:p-8 shadow-2xl mt-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent bg-[rgba(168,85,247,0.12)]">
              {ticket.category}
            </span>
            <span className="text-xs text-secondary">{ticket.statusLabel}</span>
          </div>

          <h2 className="text-2xl font-bold text-primary mb-2">
            {ticket.title}
          </h2>
          <p className="text-sm text-secondary leading-6 max-w-3xl">
            {ticket.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl border border-accent text-secondary hover:text-accent hover:border-accent transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-accent text-secondary hover:text-accent hover:border-accent transition"
          >
            Close View
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {ticket.messages && ticket.messages.length > 0 ? (
          ticket.messages.map((message) => (
            <div
              key={message.id || `${message.senderRole}-${message.timestamp}`}
              className={`rounded-2xl border p-4 ${
                message.senderRole === "admin"
                  ? "border-[rgba(168,85,247,0.35)] bg-[rgba(168,85,247,0.10)]"
                  : "border-accent bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary text-sm">
                    {message.senderName}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-secondary">
                    {message.senderRole}
                  </span>
                </div>
                <span className="text-[11px] text-secondary">
                  {message.timestamp}
                </span>
              </div>
              <p className="text-sm text-secondary leading-6">{message.text}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-accent p-4 bg-[rgba(255,255,255,0.02)]">
            <p className="text-sm text-secondary leading-6">
              No chat messages have been added to this ticket yet.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-accent p-4 bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-primary">
            Reply to Ticket
          </h3>
          {isClosed ? (
            <span className="text-xs text-secondary">
              Sending a reply will reopen this ticket.
            </span>
          ) : null}
        </div>

        <textarea
          value={replyText}
          onChange={(event) => onReplyChange(event.target.value)}
          rows={5}
          placeholder="Type your reply here..."
          className="w-full rounded-2xl border border-accent bg-[rgba(255,255,255,0.04)] px-4 py-3 text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={onSendReply}
            disabled={isSendingReply || !replyText.trim()}
            className="px-5 py-3 rounded-2xl bg-[linear-gradient(90deg,#7c3aed,#a855f7)] text-white font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSendingReply
              ? "Sending..."
              : isClosed
                ? "Reply & Reopen Ticket"
                : "Send Reply"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Support() {
  const { user } = useAuth();
  const db = getFirestore();

  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0]);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [viewMode, setViewMode] = useState("create");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isRefreshingTickets, setIsRefreshingTickets] = useState(false);
  const [isRefreshingSelectedTicket, setIsRefreshingSelectedTicket] =
    useState(false);
  const [refreshTicketsVersion, setRefreshTicketsVersion] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const selectedTicketRef = useRef(null);

  const formatTicketTimestamp = (value) => {
    if (!value) return "Just now";

    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const buildTicketFromDoc = async (ticketDoc) => {
    const data = ticketDoc.data() || {};
    const messagesRef = collection(
      db,
      "support_tickets",
      ticketDoc.id,
      "messages"
    );
    const messagesSnapshot = await getDocs(messagesRef);

    const messages = messagesSnapshot.docs
      .map((messageDoc) => {
        const messageData = messageDoc.data() || {};
        const createdAtDate =
          typeof messageData.createdAt?.toDate === "function"
            ? messageData.createdAt.toDate()
            : messageData.createdAt
              ? new Date(messageData.createdAt)
              : null;

        return {
          id: messageDoc.id,
          senderName:
            messageData.senderUsername || messageData.senderName || "Support",
          senderRole: messageData.senderRole || "user",
          timestamp: formatTicketTimestamp(messageData.createdAt),
          createdAtMillis:
            createdAtDate && !Number.isNaN(createdAtDate.getTime())
              ? createdAtDate.getTime()
              : 0,
          text: messageData.text || "",
        };
      })
      .sort(
        (firstMessage, secondMessage) =>
          firstMessage.createdAtMillis - secondMessage.createdAtMillis
      );

    const lastMessage = messages[messages.length - 1] || null;
    const status = getTicketStatusValue(data);

    return {
      id: ticketDoc.id,
      category: data.category || "General Issue",
      title: data.title || "Untitled Ticket",
      description: data.description || "",
      updatedAt: formatTicketTimestamp(data.updatedAt || data.createdAt),
      status,
      statusLabel: getTicketStatusLabel(status),
      stillOpen: status !== "closed",
      messages,
      lastMessageSenderName: lastMessage?.senderName || "",
      lastMessageSenderRole: lastMessage?.senderRole || "",
    };
  };

  const helperText = useMemo(() => {
    if (selectedCategory === "Share Your Experience") {
      return "Share feedback, ideas, or your overall experience. These can be saved without needing an open response thread.";
    }

    return "Use support tickets for issues that may need follow-up from the team, including account problems, reports, and general help.";
  }, [selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserTickets() {
      if (!user?.uid) {
        if (!cancelled) {
          setActiveTickets([]);
          setClosedTickets([]);
          setSelectedTicket(null);
          setIsLoadingTickets(false);
        }
        return;
      }

      try {
        if (!isRefreshingTickets) {
          setIsLoadingTickets(true);
        }

        const ticketsQuery = query(
          collection(db, "support_tickets"),
          where("createdBy.uid", "==", user.uid)
        );

        const ticketsSnapshot = await getDocs(ticketsQuery);
        const loadedTickets = await Promise.all(
          ticketsSnapshot.docs.map((ticketDoc) => buildTicketFromDoc(ticketDoc))
        );

        const nextActiveTickets = loadedTickets.filter(
          (ticket) => ticket.stillOpen
        );
        const nextClosedTickets = loadedTickets.filter(
          (ticket) => !ticket.stillOpen
        );

        if (!cancelled) {
          setActiveTickets(nextActiveTickets);
          setClosedTickets(nextClosedTickets);
          setSelectedTicket((currentTicket) => {
            if (!currentTicket) return null;

            return (
              loadedTickets.find((ticket) => ticket.id === currentTicket.id) ||
              null
            );
          });
        }
      } catch (error) {
        console.error("Failed to load support tickets:", error);
        if (!cancelled) {
          toast.error("Failed to load your support tickets.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTickets(false);
          setIsRefreshingTickets(false);
        }
      }
    }

    loadUserTickets();

    return () => {
      cancelled = true;
    };
  }, [db, user?.uid, refreshTicketsVersion, isRefreshingTickets]);

  const visibleTickets = viewMode === "closed" ? closedTickets : activeTickets;

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText("");
  };

  useEffect(() => {
    if (!selectedTicket || !selectedTicketRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      selectedTicketRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [selectedTicket]);

  const handleChangeView = (nextView) => {
    setViewMode(nextView);
    setSelectedTicket(null);
    setReplyText("");
  };

  const handleRefreshTickets = () => {
    if (!user?.uid || isLoadingTickets || isRefreshingTickets) return;

    setIsRefreshingTickets(true);
    setRefreshTicketsVersion((currentVersion) => currentVersion + 1);
  };

  const handleRefreshSelectedTicket = async () => {
    if (!selectedTicket?.id || isRefreshingSelectedTicket) return;

    setIsRefreshingSelectedTicket(true);

    try {
      const ticketRef = doc(db, "support_tickets", selectedTicket.id);
      const ticketSnapshot = await getDoc(ticketRef);

      if (!ticketSnapshot.exists()) {
        toast.error("This support ticket could not be found.");
        setSelectedTicket(null);
        return;
      }

      const refreshedTicket = await buildTicketFromDoc(ticketSnapshot);

      setSelectedTicket(refreshedTicket);

      setActiveTickets((currentTickets) => {
        const withoutTicket = currentTickets.filter(
          (ticket) => ticket.id !== refreshedTicket.id
        );

        return refreshedTicket.stillOpen
          ? [refreshedTicket, ...withoutTicket]
          : withoutTicket;
      });

      setClosedTickets((currentTickets) => {
        const withoutTicket = currentTickets.filter(
          (ticket) => ticket.id !== refreshedTicket.id
        );

        return refreshedTicket.stillOpen
          ? withoutTicket
          : [refreshedTicket, ...withoutTicket];
      });
    } catch (error) {
      console.error("Failed to refresh selected support ticket:", error);
      toast.error("Failed to refresh this support ticket.");
    } finally {
      setIsRefreshingSelectedTicket(false);
    }
  };

  const handleSendReply = async () => {
    const trimmedReply = replyText.trim();

    if (!user || !selectedTicket) {
      toast.error("Please select a ticket first.");
      return;
    }

    if (!trimmedReply) {
      toast.error("Please type a reply before sending.");
      return;
    }

    setIsSendingReply(true);

    try {
      let username =
        user.username || user.displayName || user.email?.split("@")[0] || "user";
      let displayName = user.displayName || user.email?.split("@")[0] || "User";
      let email = user.email || "";

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() || {};
        username = userData.username || userData.userName || username;
        displayName =
          userData.profile?.displayName || userData.displayName || displayName;
        email = userData.email || email;
      }

      const ticketRef = doc(db, "support_tickets", selectedTicket.id);

      await addDoc(collection(db, "support_tickets", selectedTicket.id, "messages"), {
        text: trimmedReply,
        senderUid: user.uid,
        senderUsername: username,
        senderName: displayName,
        senderRole: "user",
        email,
        createdAt: serverTimestamp(),
      });

      await updateDoc(ticketRef, {
        status: "open",
        still_open: true,
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });

      const newMessage = {
        id: `message-${Date.now()}`,
        senderName: username || displayName,
        senderRole: "user",
        timestamp: "Just now",
        text: trimmedReply,
      };

      const updatedTicket = {
        ...selectedTicket,
        status: "open",
        statusLabel: getTicketStatusLabel("open"),
        stillOpen: true,
        updatedAt: "Just now",
        messages: [...(selectedTicket.messages || []), newMessage],
        lastMessageSenderName: newMessage.senderName,
        lastMessageSenderRole: newMessage.senderRole,
      };

      setSelectedTicket(updatedTicket);
      setActiveTickets((prev) => {
        const withoutCurrent = prev.filter(
          (ticket) => ticket.id !== updatedTicket.id
        );
        return [updatedTicket, ...withoutCurrent];
      });
      setClosedTickets((prev) =>
        prev.filter((ticket) => ticket.id !== updatedTicket.id)
      );
      setReplyText("");
      setViewMode("active");
      toast.success("Reply sent successfully.");
    } catch (error) {
      console.error("Failed to send ticket reply:", error);
      toast.error(error?.message || "Failed to send reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory(CATEGORY_OPTIONS[0]);
    setTicketTitle("");
    setTicketDescription("");
  };

  const handleSubmitTicket = async () => {
    const trimmedTitle = ticketTitle.trim();
    const trimmedDescription = ticketDescription.trim();

    if (!user) {
      toast.error("Please sign in to submit a support ticket.");
      return;
    }

    if (!trimmedTitle) {
      toast.error("Please add a ticket title.");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Please add a ticket description.");
      return;
    }

    setIsSubmitting(true);

    try {
      let username =
        user.username || user.displayName || user.email?.split("@")[0] || "user";
      let displayName = user.displayName || user.email?.split("@")[0] || "User";
      let email = user.email || "";

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() || {};
        username = userData.username || userData.userName || username;
        displayName = userData.profile?.displayName || displayName;
        email = userData.email || email;
      }

      const shouldStartClosed = selectedCategory === "Share Your Experience";
      const initialStatus = shouldStartClosed ? "closed" : "open";
      const newTicketPayload = {
        assignedAdmin: {
          uid: "",
          username: "",
        },
        category: selectedCategory,
        createdAt: serverTimestamp(),
        createdBy: {
          displayName,
          email,
          uid: user.uid,
          username,
        },
        description: trimmedDescription,
        lastMessageAt: serverTimestamp(),
        reviewStatus: "Pending",
        status: initialStatus,
        still_open: initialStatus !== "closed",
        title: trimmedTitle,
        updatedAt: serverTimestamp(),
      };

      const ticketRef = await addDoc(
        collection(db, "support_tickets"),
        newTicketPayload
      );

      await addDoc(collection(db, "support_tickets", ticketRef.id, "messages"), {
        text: trimmedDescription,
        senderUid: user.uid,
        senderUsername: username,
        senderName: displayName,
        senderRole: "user",
        email,
        createdAt: serverTimestamp(),
      });

      const createdTicket = {
        id: ticketRef.id,
        category: selectedCategory,
        title: trimmedTitle,
        description: trimmedDescription,
        updatedAt: "Just now",
        status: initialStatus,
        statusLabel: getTicketStatusLabel(initialStatus),
        stillOpen: initialStatus !== "closed",
        messages: [
          {
            id: `message-${ticketRef.id}`,
            senderName: displayName || username,
            senderRole: "user",
            timestamp: "Just now",
            text: trimmedDescription,
          },
        ],
        lastMessageSenderName: displayName || username,
        lastMessageSenderRole: "user",
      };

      if (shouldStartClosed) {
        setClosedTickets((prev) => [createdTicket, ...prev]);
        setViewMode("closed");
      } else {
        setActiveTickets((prev) => [createdTicket, ...prev]);
        setViewMode("active");
      }

      setSelectedTicket(createdTicket);
      resetForm();
      toast.success("Support ticket submitted successfully!");
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
      toast.error(error?.message || "Failed to submit support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-primary font-main px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient-primary mb-4">
            Support Center
          </h1>
          <p className="max-w-2xl mx-auto text-secondary text-base sm:text-lg leading-7">
            Create support tickets, track your active requests, and review
            closed conversations in one place.
          </p>
        </div>

        <div className="bg-card border border-accent rounded-3xl p-3 sm:p-4 shadow-2xl mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleChangeView("create")}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                viewMode === "create"
                  ? "bg-[linear-gradient(90deg,#7c3aed,#a855f7)] text-white shadow-lg"
                  : "text-secondary hover:text-accent bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              Create Ticket
            </button>
            <button
              onClick={() => handleChangeView("active")}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                viewMode === "active"
                  ? "bg-[linear-gradient(90deg,#7c3aed,#a855f7)] text-white shadow-lg"
                  : "text-secondary hover:text-accent bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              Active Tickets
            </button>
            <button
              onClick={() => handleChangeView("closed")}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                viewMode === "closed"
                  ? "bg-[linear-gradient(90deg,#7c3aed,#a855f7)] text-white shadow-lg"
                  : "text-secondary hover:text-accent bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              Closed Tickets
            </button>
          </div>
        </div>

        {viewMode === "create" ? (
          <section className="bg-card border border-accent rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Open a Support Ticket
              </h2>
              <p className="text-sm text-secondary leading-6">
                Choose the category that best matches your request, then add a
                short title and description.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-2xl border border-accent bg-[rgba(255,255,255,0.04)] px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-black">
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-secondary leading-5">
                  {helperText}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Give your ticket a short title"
                  className="w-full rounded-2xl border border-accent bg-[rgba(255,255,255,0.04)] px-4 py-3 text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  rows={6}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Tell us what happened and include any important details."
                  className="w-full rounded-2xl border border-accent bg-[rgba(255,255,255,0.04)] px-4 py-3 text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSubmitTicket}
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-2xl bg-[linear-gradient(90deg,#7c3aed,#a855f7)] text-white font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-3 rounded-2xl border border-accent text-secondary hover:text-accent hover:border-accent transition"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            <section className="bg-card border border-accent rounded-3xl p-6 sm:p-8 shadow-2xl max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {viewMode === "active" ? "Active Tickets" : "Closed Tickets"}
                </h2>
                <p className="text-sm text-secondary leading-6">
                  {viewMode === "active"
                    ? "Review your current support conversations and open any ticket to continue the thread."
                    : "Review your closed tickets and reopen old requests when needed."}
                </p>
              </div>

              <div className="space-y-4">
                {isLoadingTickets ? (
                  <div className="rounded-2xl border border-dashed border-accent p-8 text-center bg-[rgba(255,255,255,0.02)]">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Loading tickets...
                    </h3>
                    <p className="text-sm text-secondary leading-6 max-w-2xl mx-auto">
                      We are fetching your support history now.
                    </p>
                  </div>
                ) : visibleTickets.length > 0 ? (
                  visibleTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onOpen={handleOpenTicket}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-accent p-8 text-center bg-[rgba(255,255,255,0.02)]">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      {viewMode === "active"
                        ? "No active tickets yet"
                        : "No closed tickets yet"}
                    </h3>
                    <p className="text-sm text-secondary leading-6 max-w-2xl mx-auto">
                      {viewMode === "active"
                        ? "Your open support requests will appear here after you submit them."
                        : "Closed tickets and saved feedback conversations will appear here once they have been resolved or submitted as experience feedback."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {selectedTicket ? (
              <div ref={selectedTicketRef} className="max-w-5xl mx-auto scroll-mt-24">
                <TicketConversation
                  ticket={selectedTicket}
                  onClose={() => {
                    setSelectedTicket(null);
                    setReplyText("");
                  }}
                  onRefresh={handleRefreshSelectedTicket}
                  isRefreshing={isRefreshingSelectedTicket}
                  replyText={replyText}
                  onReplyChange={setReplyText}
                  onSendReply={handleSendReply}
                  isSendingReply={isSendingReply}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}