import {
  AuditorAdded,
  AuditorRemoved,
} from "../generated/TreeAuditorRegistry/TreeAuditorRegistry";
import { Auditor } from "../generated/schema";
import { Address } from "@graphprotocol/graph-ts";
import { getOrCreateOwner } from "./tree-controller";

export function handleAuditorAdded(event: AuditorAdded): void {
  const id = event.params.auditor_;

  let owner = getOrCreateOwner(id);
  let auditor = getOrCreateAuditor(id);

  owner.isAuditor = true;
  auditor.isActive = true;

  owner.save();
  auditor.save();
}

export function handleAuditorRemoved(event: AuditorRemoved): void {
  const id = event.params.auditor_;

  let owner = getOrCreateOwner(id);
  let auditor = getOrCreateAuditor(id);

  owner.isAuditor = false;
  auditor.isActive = false;

  owner.save();
  auditor.save();
}

export function getOrCreateAuditor(id: Address): Auditor {
  let auditor = Auditor.load(id);
  if (auditor == null) {
    auditor = new Auditor(id);
    auditor.isActive = true;
    auditor.save();
  }
  return auditor;
}
