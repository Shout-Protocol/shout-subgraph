import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { createTreeAddedEvent } from "./tree-controller-utils";
import { handleTreeAdded } from "../src/tree-controller";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("handleTreeAdded", () => {
  beforeAll(() => {
    // let owner = Address.fromString("0x0000000000000000000000000000000000000001")
    // let spender = Address.fromString(
    //   "0x0000000000000000000000000000000000000001"
    // )
    // let value = BigInt.fromI32(234)
    // let newApprovalEvent = createApprovalEvent(owner, spender, value)
    // handleApproval(newApprovalEvent)
  });

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Should add new tree", () => {
    let owner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let nftAddress = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    let tokenId = BigInt.fromI32(0);
    let treeNumber = BigInt.fromI32(10);
    const treeAddedEvent = createTreeAddedEvent(
      owner,
      nftAddress,
      tokenId,
      treeNumber
    );

    handleTreeAdded(treeAddedEvent);

    const id =
      treeAddedEvent.params.nftAddress.toHex() +
      "-" +
      treeAddedEvent.params.tokenId.toHex();

    assert.fieldEquals("Tree", id, "owner", owner.toHexString());
    assert.fieldEquals("Tree", id, "nftAddress", nftAddress.toHexString());
    assert.fieldEquals("Tree", id, "tokenId", tokenId.toString());
    assert.fieldEquals("Tree", id, "owner", owner.toHexString());
  });
});
