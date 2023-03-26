import { Auditor, Feed, Owner, Report, Tree } from "../../generated/schema";
import {
  TreeAdded,
  TreeAudited,
  TreeTransferred,
  TreeWithdrew,
} from "../../generated/TreeController/TreeController";

const ADDED = "added";
const TRANSFERRED = "transferred";
const WITHDREW = "withdrew";
const AUDITED = "audited";

export function createTreeAddedFeed(
  event: TreeAdded,
  tree: Tree,
  owner: Owner
): void {
  const feed = new Feed(event.transaction.hash.toHexString());

  feed.type = ADDED;
  feed.timestamp = event.block.timestamp;
  feed.txHash = event.transaction.hash;
  feed.tree = tree.id;
  feed.owner = owner.id;

  feed.save();
}

export function createTreeTransferredFeed(
  event: TreeTransferred,
  tree: Tree,
  from: Owner,
  to: Owner
): void {
  const feed = new Feed(event.transaction.hash.toHexString());

  feed.type = TRANSFERRED;
  feed.timestamp = event.block.timestamp;
  feed.txHash = event.transaction.hash;
  feed.tree = tree.id;
  feed.from = from.id;
  feed.to = to.id;

  feed.save();
}

export function createTreeWithdrewFeed(
  event: TreeWithdrew,
  tree: Tree,
  owner: Owner
): void {
  const feed = new Feed(event.transaction.hash.toHexString());

  feed.type = WITHDREW;
  feed.timestamp = event.block.timestamp;
  feed.txHash = event.transaction.hash;
  feed.tree = tree.id;
  feed.owner = owner.id;

  feed.save();
}

export function createTreeAuditedFeed(
  event: TreeAudited,
  tree: Tree,
  auditor: Auditor,
  report: Report
): void {
  const feed = new Feed(event.transaction.hash.toHexString());

  feed.type = AUDITED;
  feed.timestamp = event.block.timestamp;
  feed.txHash = event.transaction.hash;
  feed.tree = tree.id;
  feed.auditor = auditor.id;
  feed.report = report.id;

  feed.save();
}
