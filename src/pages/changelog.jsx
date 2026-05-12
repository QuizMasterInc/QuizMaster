import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import '../config/firebase';
import { appVersion } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import useProfileSectionData from '../hooks/useProfileSectionData';

const emptyForm = {
  version: appVersion,
  title: '',
  description: '',
  changesText: '',
};

const getEntryStatusLabel = (entry) => {
  if (entry.status === 'pending_edit') return 'Pending Edit Approval';
  if (entry.status === 'pending_review') return 'Pending Review';
  if (entry.status === 'published') return 'Published';
  if (entry.published) return 'Published';
  return 'Draft';
};

const getEntryStatusClasses = (entry) => {
  if (entry.status === 'pending_edit') return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
  if (entry.status === 'pending_review') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
  if (entry.status === 'published' || entry.published) return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

const Changelog = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const { user } = useAuth();
  const { profile } = useProfileSectionData(user?.uid);
  const isAdmin = Boolean(user && !user.isAnonymous && profile?.isAdmin === true);

  const currentAdminName =
    profile?.displayName ||
    user?.displayName ||
    user?.email ||
    'Admin';

  const fetchChangelog = async () => {
    setLoading(true);
    setError('');

    try {
      let request = firebase.firestore().collection('changelog');
      let snapshot;

      if (!isAdmin) {
        request = request
          .where('published', '==', true)
          .where('status', '==', 'published');

        snapshot = await request.get();
      } else {
        snapshot = await request.orderBy('createdAt', 'desc').get();
      }

      const changelogEntries = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((firstEntry, secondEntry) => {
          const firstCreatedAt = firstEntry.createdAt?.toMillis?.() || 0;
          const secondCreatedAt = secondEntry.createdAt?.toMillis?.() || 0;

          return secondCreatedAt - firstCreatedAt;
        });

      setEntries(changelogEntries);
    } catch (err) {
      console.error('Unable to load changelog entries:', err);
      setError('Unable to load changelog entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetForm = () => {
    setForm({
      version: appVersion,
      title: '',
      description: '',
      changesText: '',
    });
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const getChangesFromForm = () => form.changesText
    .split('\n')
    .map((change) => change.trim())
    .filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    const changes = getChangesFromForm();

    if (!form.version.trim() || !form.title.trim() || !form.description.trim() || changes.length === 0) {
      setError('Please enter a version, title, description, and at least one change.');
      setSaving(false);
      return;
    }

    if (!isAdmin) {
      setError('Only admins can create or edit changelog entries.');
      setSaving(false);
      return;
    }

    const proposedData = {
      version: form.version.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      changes,
    };

    try {
      if (editingEntry) {
        await firebase.firestore().collection('changelog').doc(editingEntry.id).update({
          pendingChanges: proposedData,
          status: 'pending_edit',
          published: Boolean(editingEntry.published),
          editProposedBy: user.uid,
          editProposedByName: currentAdminName,
          editProposedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setSuccessMessage('Edit submitted for approval. Another admin must approve it before it is applied.');
      } else {
        await firebase.firestore().collection('changelog').add({
          ...proposedData,
          published: false,
          status: 'pending_review',
          createdBy: user.uid,
          createdByName: currentAdminName,
          proposedBy: user.uid,
          proposedByName: currentAdminName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setSuccessMessage('Changelog entry submitted for approval. Another admin must approve it before it is published.');
      }

      resetForm();
      await fetchChangelog();
    } catch (err) {
      console.error('Unable to save changelog entry:', err);
      setError('Unable to save changelog entry. Please check your Firestore permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    const source = entry.pendingChanges || entry;

    setError('');
    setSuccessMessage('');
    setEditingEntry(entry);
    setForm({
      version: source.version || appVersion,
      title: source.title || '',
      description: source.description || '',
      changesText: Array.isArray(source.changes) ? source.changes.join('\n') : '',
    });
    setShowForm(true);
  };

  const handleApprove = async (entry) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    const proposerId = entry.status === 'pending_edit' ? entry.editProposedBy : entry.proposedBy;

    if (proposerId === user?.uid) {
      setError('Another admin must approve this changelog change. You cannot approve your own submission.');
      setSaving(false);
      return;
    }

    try {
      const entryRef = firebase.firestore().collection('changelog').doc(entry.id);

      if (entry.status === 'pending_edit') {
        const pendingChanges = entry.pendingChanges;

        if (!pendingChanges) {
          setError('This entry does not have pending changes to approve.');
          setSaving(false);
          return;
        }

        await entryRef.update({
          ...pendingChanges,
          pendingChanges: firebase.firestore.FieldValue.delete(),
          status: 'published',
          published: true,
          approvedBy: user.uid,
          approvedByName: currentAdminName,
          approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
          editProposedBy: firebase.firestore.FieldValue.delete(),
          editProposedByName: firebase.firestore.FieldValue.delete(),
          editProposedAt: firebase.firestore.FieldValue.delete(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setSuccessMessage('Changelog edit approved and published.');
      } else {
        await entryRef.update({
          status: 'published',
          published: true,
          approvedBy: user.uid,
          approvedByName: currentAdminName,
          approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setSuccessMessage('Changelog entry approved and published.');
      }

      await fetchChangelog();
    } catch (err) {
      console.error('Unable to approve changelog entry:', err);
      setError('Unable to approve changelog entry. Please check your Firestore permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (entry) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const entryRef = firebase.firestore().collection('changelog').doc(entry.id);

      if (entry.status === 'pending_edit') {
        await entryRef.update({
          pendingChanges: firebase.firestore.FieldValue.delete(),
          status: entry.published ? 'published' : 'draft',
          editProposedBy: firebase.firestore.FieldValue.delete(),
          editProposedByName: firebase.firestore.FieldValue.delete(),
          editProposedAt: firebase.firestore.FieldValue.delete(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setSuccessMessage('Pending edit rejected.');
      } else {
        await entryRef.update({
          status: 'draft',
          published: false,
          rejectedBy: user.uid,
          rejectedByName: currentAdminName,
          rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setSuccessMessage('Pending changelog entry rejected and moved to draft.');
      }

      await fetchChangelog();
    } catch (err) {
      console.error('Unable to reject changelog entry:', err);
      setError('Unable to reject changelog entry. Please check your Firestore permissions.');
    } finally {
      setSaving(false);
    }
  };

  const canApproveEntry = (entry) => {
    if (!isAdmin) return false;
    if (!['pending_review', 'pending_edit'].includes(entry.status)) return false;

    const proposerId = entry.status === 'pending_edit' ? entry.editProposedBy : entry.proposedBy;
    return proposerId !== user?.uid;
  };

  const isEntryProposer = (entry) => {
    if (!isAdmin) return false;
    if (!['pending_review', 'pending_edit'].includes(entry.status)) return false;

    const proposerId = entry.status === 'pending_edit' ? entry.editProposedBy : entry.proposedBy;
    return proposerId === user?.uid;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300">
            QuizMaster
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400">Changelog</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View updates, fixes, and improvements for QuizMaster.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMessage('');

                  if (showForm) {
                    resetForm();
                  } else {
                    setEditingEntry(null);
                    setForm({
                      version: appVersion,
                      title: '',
                      description: '',
                      changesText: '',
                    });
                    setShowForm(true);
                  }
                }}
                className="rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-500"
              >
                {showForm ? 'Close Form' : 'Create Changelog Entry'}
              </button>
            )}
          </div>
        </header>

        {isAdmin && showForm && (
          <section className="rounded-2xl border border-purple-200 bg-white p-6 shadow-lg dark:border-purple-800 dark:bg-gray-900">
            <div className="mb-5 border-b border-gray-200 pb-4 dark:border-gray-800">
              <h2 className="text-2xl font-semibold text-gray-950 dark:text-white">
                {editingEntry ? 'Submit Changelog Edit' : 'Add Changelog Entry'}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {editingEntry
                  ? 'Edits are saved as pending changes and must be approved by another admin.'
                  : 'New changelog entries must be approved by another admin before they are published.'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Version</span>
                  <input
                    name="version"
                    value={form.version}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    placeholder="2.3.0"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    placeholder="Changelog Page Added"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="min-h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  placeholder="Briefly summarize this release."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Changes</span>
                <textarea
                  name="changesText"
                  value={form.changesText}
                  onChange={handleChange}
                  className="min-h-32 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  placeholder={"Added a new feature\nFixed a bug\nImproved admin tools"}
                />
              </label>

              <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
                {editingEntry
                  ? 'This edit will not go live until another admin approves it.'
                  : 'This entry will not be public until another admin approves it.'}
              </div>

              {error && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                  {successMessage}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingEntry ? 'Submit Edit for Approval' : 'Submit for Approval'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 transition hover:border-purple-500 hover:text-purple-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-purple-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {error && !showForm && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {successMessage && !showForm && (
          <p className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
            {successMessage}
          </p>
        )}

        {loading && (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Loading changelog entries...
          </p>
        )}

        {!loading && entries.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            No changelog entries found yet.
          </p>
        )}

        {!loading && entries.map((entry) => {
          const statusLabel = getEntryStatusLabel(entry);
          const statusClasses = getEntryStatusClasses(entry);
          const proposerName = entry.status === 'pending_edit' ? entry.editProposedByName : entry.proposedByName;
          const awaitingOwnApproval = isEntryProposer(entry);
          const canAdminReviewEntry = canApproveEntry(entry);

          return (
            <section
              key={entry.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-gray-950 dark:text-white">
                    Version {entry.version || appVersion}
                  </h2>

                  {isAdmin && (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses}`}>
                      {statusLabel}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-500">
                  {entry.title}
                </p>

                {isAdmin && ['pending_review', 'pending_edit'].includes(entry.status) && (
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-500">
                    {proposerName && <p>Proposed by {proposerName}</p>}

                    {awaitingOwnApproval && (
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">
                        Awaiting approval from another admin.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{entry.description}</p>

                {entry.changes?.length > 0 && (
                  <ul className="list-inside list-disc space-y-2">
                    {entry.changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                )}

                {isAdmin && entry.pendingChanges && (
                  <div className="mt-5 rounded-xl border border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Pending edit awaiting approval</p>
                    <p className="mt-2 text-sm text-blue-800 dark:text-blue-100">Version {entry.pendingChanges.version}</p>
                    <p className="mt-1 text-sm text-blue-800 dark:text-blue-100">{entry.pendingChanges.title}</p>
                    <p className="mt-2 text-sm text-blue-800 dark:text-blue-100">{entry.pendingChanges.description}</p>

                    {entry.pendingChanges.changes?.length > 0 && (
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-100">
                        {entry.pendingChanges.changes.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {isAdmin && (
                  <div className="flex flex-wrap gap-3 pt-3">
                    {awaitingOwnApproval ? (
                      <span className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
                        Awaiting approval
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-500 hover:text-purple-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-purple-300"
                        >
                          Edit
                        </button>

                        {canAdminReviewEntry && (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleApprove(entry)}
                              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleReject(entry)}
                              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Changelog;