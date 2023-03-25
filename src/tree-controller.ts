import {
  TreeAdded, TreeAudited, TreeTransferred, TreeWithdrew
} from "../generated/TreeController/TreeController"
import {
  TreeNFT
} from "../generated/TreeController/TreeNFT"
import {
  Tree,
  Report,
  Owner,
  Auditor,
  NFT,
} from "../generated/schema"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleTreeAdded(event: TreeAdded): void {
  const id = event.params.nftAddress.toHex() + '-' + event.params.tokenId.toHex()

  let tree = Tree.load(id);
  let owner = getOrCreateOwner(event.params.owner);

  if (!tree) {
    tree = new Tree(id)
    tree.owner = owner.id
    tree.nftAddress = event.params.nftAddress
    tree.tokenId = event.params.tokenId
    tree.treeNumber = event.params.treeNumber
    tree.isActive = true
    tree.nft = getOrCreateNFT(event.params.nftAddress, event.params.tokenId).id

    tree.createdAt = event.block.timestamp
    tree.createdTxHash = event.transaction.hash
    tree.updatedAt = event.block.timestamp
    tree.updatedTxHash = event.transaction.hash
  } else {
    tree.owner = owner.id
    tree.treeNumber = event.params.treeNumber

    tree.isActive = true
    tree.updatedAt = event.block.timestamp
    tree.updatedTxHash = event.transaction.hash
  }

  owner.totalTrees = owner.totalTrees.plus(event.params.treeNumber)

  owner.save()
  tree.save()
}

export function handleTreeTransferred(event: TreeTransferred): void {
  const id = event.params.nftAddress.toHex() + '-' + event.params.tokenId.toHex()

  let tree = Tree.load(id);
  let oldOwner = getOrCreateOwner(event.params.from);
  let newOwner = getOrCreateOwner(event.params.to);

  if (tree) {
    tree.owner = event.params.to;

    tree.updatedAt = event.block.timestamp
    tree.updatedTxHash = event.transaction.hash

    oldOwner.totalTrees = oldOwner.totalTrees.minus(tree.treeNumber)
    newOwner.totalTrees = newOwner.totalTrees.plus(tree.treeNumber)

    tree.save()
  }

  oldOwner.save()
  newOwner.save()
}

export function handleTreeWithdrew(
  event: TreeWithdrew
): void {
  const id = event.params.nftAddress.toHex() + '-' + event.params.tokenId.toHex()

  const tree = Tree.load(id);

  if (tree) {
    const owner = getOrCreateOwner(tree.owner as Address)
    owner.totalTrees = owner.totalTrees.minus(tree.treeNumber)

    tree.owner = Address.zero()
    tree.isActive = false

    owner.save()
    tree.save()
  }
}

export function handleTreeAudited(event: TreeAudited): void {
  const treeId = event.params.nftAddress.toHex() + '-' + event.params.tokenId.toHex()
  const tree = Tree.load(treeId);

  const reportId = event.transaction.hash.toHex();
  const report = new Report(reportId);

  report.auditor = getOrCreateAuditor(event.params.auditor).id
  report.treeNumber = event.params.treeNumber
  report.timestamp = event.block.timestamp
  report.transactionHash = event.transaction.hash

  if (tree) {
    const owner = getOrCreateOwner(tree.owner as Address)

    if (event.params.treeNumber.gt(tree.treeNumber)) {
      const diff = event.params.treeNumber.minus(tree.treeNumber)
      owner.totalTrees = owner.totalTrees.plus(diff)
    } else {
      const diff = tree.treeNumber.minus(event.params.treeNumber)
      owner.totalTrees = owner.totalTrees.minus(diff)
    }

    report.tree = tree.id

    tree.save()
    owner.save()
  }

  report.save()
}

export function getOrCreateOwner(id: Address): Owner {
  let owner = Owner.load(id);
  if (owner == null) {
    owner = new Owner(id);
    owner.totalTrees = BigInt.fromI32(0);
    owner.save();
  }
  return owner;
}

export function getOrCreateAuditor(id: Address): Auditor {
  let auditor = Auditor.load(id);
  if (auditor == null) {
    auditor = new Auditor(id);
    auditor.save();
  }
  return auditor;
}

export function getOrCreateNFT(address: Address, tokenId: BigInt): NFT {
  let id = address.toHex() + "-" + tokenId.toHex()
  let nft = NFT.load(id);
  if (nft == null) {
    nft = new NFT(id);

    let instance = TreeNFT.bind(address);
    let tokenUri = instance.try_tokenURI(tokenId)
    if (!tokenUri.reverted) {
      nft.tokenUri = tokenUri.value
    }

    nft.save();
  }
  return nft;
}