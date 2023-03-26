import {
  TreeAdded,
  TreeAudited,
  TreeTransferred,
  TreeWithdrew,
} from "../generated/TreeController/TreeController";
import { TreeNFT } from "../generated/TreeController/TreeNFT";
import {
  Tree,
  Report,
  Owner,
  NFT,
  App,
} from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { getOrCreateAuditor } from "./tree-auditor";
import {
  createTreeAddedFeed,
  createTreeAuditedFeed,
  createTreeTransferredFeed,
  createTreeWithdrewFeed,
} from "./helpers/feed";

const APP_ID = "app";

export function handleTreeAdded(event: TreeAdded): void {
  const id =
    event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString();

  let tree = Tree.load(id);
  let app = getOrCreateApp();
  let owner = getOrCreateOwner(event.params.owner);

  if (!tree) {
    tree = new Tree(id);
    tree.owner = owner.id;
    tree.nftAddress = event.params.nftAddress;
    tree.tokenId = event.params.tokenId;
    tree.treeNumber = event.params.treeNumber;
    tree.isActive = true;
    tree.nft = getOrCreateNFT(event.params.nftAddress, event.params.tokenId).id;
    tree.reportCount = BigInt.fromI32(0);

    tree.createdAt = event.block.timestamp;
    tree.createdTxHash = event.transaction.hash;
    tree.updatedAt = event.block.timestamp;
    tree.updatedTxHash = event.transaction.hash;
  } else {
    tree.owner = owner.id;
    tree.treeNumber = event.params.treeNumber;

    tree.isActive = true;
    tree.updatedAt = event.block.timestamp;
    tree.updatedTxHash = event.transaction.hash;
  }

  owner.totalTrees = owner.totalTrees.plus(event.params.treeNumber);
  app.totalTrees = app.totalTrees.plus(event.params.treeNumber);

  createTreeAddedFeed(event, tree, owner);

  owner.save();
  tree.save();
  app.save();
}

export function handleTreeTransferred(event: TreeTransferred): void {
  const id =
    event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString();

  let tree = Tree.load(id);
  let oldOwner = getOrCreateOwner(event.params.from);
  let newOwner = getOrCreateOwner(event.params.to);

  if (tree) {
    tree.owner = event.params.to;

    tree.updatedAt = event.block.timestamp;
    tree.updatedTxHash = event.transaction.hash;

    oldOwner.totalTrees = oldOwner.totalTrees.minus(tree.treeNumber);
    newOwner.totalTrees = newOwner.totalTrees.plus(tree.treeNumber);

    const isAudited = tree.reportCount.gt(BigInt.fromI32(0));
    if (isAudited) {
      oldOwner.auditedTrees = oldOwner.auditedTrees.minus(tree.treeNumber);
      newOwner.auditedTrees = newOwner.auditedTrees.plus(tree.treeNumber);
    }

    createTreeTransferredFeed(event, tree, oldOwner, newOwner);

    tree.save();
  }

  oldOwner.save();
  newOwner.save();
}

export function handleTreeWithdrew(event: TreeWithdrew): void {
  const id =
    event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString();

  const tree = Tree.load(id);
  const app = getOrCreateApp();

  if (tree) {
    const owner = getOrCreateOwner(Address.fromBytes(tree.owner));
    owner.totalTrees = owner.totalTrees.minus(tree.treeNumber);
    app.totalTrees = app.totalTrees.minus(tree.treeNumber);

    const isAudited = tree.reportCount.gt(BigInt.fromI32(0));
    if (isAudited) {
      app.auditedTrees = app.auditedTrees.minus(tree.treeNumber);
      owner.auditedTrees = owner.auditedTrees.minus(tree.treeNumber);
    }

    tree.owner = Address.zero();
    tree.isActive = false;

    createTreeWithdrewFeed(event, tree, owner);

    owner.save();
    tree.save();
  }
}

export function handleTreeAudited(event: TreeAudited): void {
  const treeId =
    event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString();
  const tree = Tree.load(treeId);

  const reportId = event.transaction.hash.toHex();
  const report = new Report(reportId);
  const auditor = getOrCreateAuditor(event.params.auditor);

  report.auditor = auditor.id;
  report.treeNumber = event.params.treeNumber;
  report.timestamp = event.block.timestamp;
  report.transactionHash = event.transaction.hash;

  if (tree) {
    const app = getOrCreateApp();
    const owner = getOrCreateOwner(Address.fromBytes(tree.owner));

    const isAudited = tree.reportCount.gt(BigInt.fromI32(0));
    const isIncrease = event.params.treeNumber.gt(tree.treeNumber);

    if (!isAudited) {
      app.auditedTrees = app.auditedTrees.plus(event.params.treeNumber);
      owner.auditedTrees = owner.auditedTrees.plus(event.params.treeNumber);
    }

    if (isIncrease) {
      const diff = event.params.treeNumber.minus(tree.treeNumber);
      owner.totalTrees = owner.totalTrees.plus(diff);
      app.totalTrees = app.totalTrees.plus(diff);

      if (isAudited) {
        app.auditedTrees = app.auditedTrees.plus(diff);
        owner.auditedTrees = owner.auditedTrees.plus(diff);
      }
    } else {
      const diff = tree.treeNumber.minus(event.params.treeNumber);
      owner.totalTrees = owner.totalTrees.minus(diff);
      app.totalTrees = app.totalTrees.minus(diff);

      if (isAudited) {
        app.auditedTrees = app.auditedTrees.minus(diff);
        owner.auditedTrees = owner.auditedTrees.minus(diff);
      }
    }

    tree.treeNumber = event.params.treeNumber;
    tree.reportCount = tree.reportCount.plus(BigInt.fromI32(1));
    report.tree = tree.id;

    createTreeAuditedFeed(event, tree, auditor, report);

    app.save();
    tree.save();
    owner.save();
  }

  report.save();
}

export function getOrCreateOwner(id: Address): Owner {
  let owner = Owner.load(id);
  if (owner == null) {
    owner = new Owner(id);
    owner.totalTrees = BigInt.fromI32(0);
    owner.auditedTrees = BigInt.fromI32(0);
    owner.isAuditor = false;
    owner.save();
  }
  return owner;
}

export function getOrCreateNFT(address: Address, tokenId: BigInt): NFT {
  let id = address.toHex() + "-" + tokenId.toString();
  let nft = NFT.load(id);
  if (nft == null) {
    nft = new NFT(id);

    let instance = TreeNFT.bind(address);
    let tokenUri = instance.try_tokenURI(tokenId);
    if (!tokenUri.reverted) {
      nft.tokenUri = tokenUri.value;
    }

    nft.save();
  }
  return nft;
}

export function getOrCreateApp(): App {
  let app = App.load(APP_ID);
  if (app === null) {
    app = new App(APP_ID);

    app.totalTrees = BigInt.fromI32(0);
    app.auditedTrees = BigInt.fromI32(0);
    app.save();
  }
  return app;
}
