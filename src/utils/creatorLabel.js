/**
 * Creator label helper.
 * Priority:
 * 1) creatorUsername / username → @username
 * 2) creatorName / displayName → fallback human label
 * 3) legacy nested creator.displayName
 * 4) Anonymous
 */
export const getCreatorLabel = (item) => {
  const username = item?.creatorUsername || item?.username;
  if (typeof username === "string" && username.trim()) {
    return `@${username.replace(/^@/, "")}`;
  }

  const name =
    item?.creatorName ||
    item?.creatorDisplayName ||
    item?.displayName;

  if (typeof name === "string" && name.trim()) {
    return name;
  }

  const legacyName = item?.creator?.displayName;
  if (typeof legacyName === "string" && legacyName.trim()) {
    return legacyName;
  }

  return "Anonymous";
};

export const collectCreatorUid = (item) =>
  item?.creator?.uid ||
  item?.creatorId ||
  item?.creatorID ||
  item?.createdBy ||
  item?.userId ||
  item?.creator?.userId ||
  null;