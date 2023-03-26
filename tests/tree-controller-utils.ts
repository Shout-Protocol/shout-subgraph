import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  TreeAdded,
  TreeTransferred,
  TreeWithdrew,
  TreeAudited,
} from "../generated/TreeController/TreeController";

export function createTreeAddedEvent(
  owner: Address,
  nftAddress: Address,
  tokenId: BigInt,
  treeNumber: BigInt
): TreeAdded {
  let treeAddedEvent = newMockEvent() as TreeAdded;

  treeAddedEvent.parameters = new Array();

  treeAddedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  treeAddedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  );
  treeAddedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  treeAddedEvent.parameters.push(
    new ethereum.EventParam(
      "treeNumber",
      ethereum.Value.fromUnsignedBigInt(treeNumber)
    )
  );

  return treeAddedEvent;
}

export function createTreeTransferredEvent(
  from: Address,
  to: Address,
  nftAddress: Address,
  tokenId: BigInt
): TreeTransferred {
  let treeTransferredEvent = newMockEvent() as TreeTransferred;

  treeTransferredEvent.parameters = new Array();

  treeTransferredEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  treeTransferredEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  treeTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  );

  treeTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return treeTransferredEvent;
}

export function createTreeWithdrew(
  to: Address,
  nftAddress: Address,
  tokenId: BigInt
): TreeWithdrew {
  let treeWithdrewEvent = newMockEvent() as TreeWithdrew;

  treeWithdrewEvent.parameters = new Array();

  treeWithdrewEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  treeWithdrewEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  );
  treeWithdrewEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return treeWithdrewEvent;
}

export function createTreeAuditedEvent(
  auditor: Address,
  nftAddress: Address,
  tokenId: BigInt,
  treeNumber: BigInt
): TreeAudited {
  let treeAuditedEvent = newMockEvent() as TreeAudited;

  treeAuditedEvent.parameters = new Array();

  treeAuditedEvent.parameters.push(
    new ethereum.EventParam("auditor", ethereum.Value.fromAddress(auditor))
  );
  treeAuditedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  );
  treeAuditedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  treeAuditedEvent.parameters.push(
    new ethereum.EventParam(
      "treeNumber",
      ethereum.Value.fromUnsignedBigInt(treeNumber)
    )
  );

  return treeAuditedEvent;
}
