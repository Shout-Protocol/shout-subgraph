import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  BoostAdjusted,
  PostCreated,
  YieldVaultAdded,
  YieldVaultPaused,
} from "../generated/Shouter/Shouter";
import {
  Post,
  PostBoost,
  Token,
  User,
  UserBoost,
  YieldVault,
} from "../generated/schema";
import { ERC20 } from "../generated/Shouter/ERC20";
import { IYieldVault } from "../generated/Shouter/IYieldVault";
import {
  createNotificationPayload,
  sendPushNotification,
} from "./libs/push-notification";

export function handlePostCreated(event: PostCreated): void {
  let post = new Post(event.params.postId.toString());
  let owner = getOrCreateUser(event.params.owner);

  post.owner = owner.id;
  post.ipfsHash = event.params.ipfsHash;

  post.save();
}

export function handleBoostAdjusted(event: BoostAdjusted): void {
  let post = Post.load(event.params.postId.toString());
  let vault = YieldVault.load(event.params.yieldVaultId.toString());

  if (post && vault) {
    let postBoost = getOrCreatePostBoost(
      event.params.postId,
      event.params.yieldVaultId
    );
    postBoost.amount = event.params.newAmount;

    let userBoost = getOrCreateUserBoost(
      Address.fromString(post.owner),
      event.params.yieldVaultId
    );
    userBoost.amount = event.params.newAmount;

    postBoost.save();
    userBoost.save();

    let token = Token.load(vault.token);
    if (token) {
      let power = exponentToBigInt(token.decimals);
      let amount = event.params.newAmount.div(power);
      // Send notification
      if (event.params.oldAmount.equals(BigInt.fromI32(0))) {
        let title = "A Post Has Been Boosted!";
        let body = `${post.owner} has boosted a post with ${amount} ${token.symbol}!`;
        sendPushNotification("*", createNotificationPayload(title, body));
      } else if (event.params.newAmount.ge(event.params.oldAmount)) {
        let title = "A Post Has Been Boosted!";
        let body = `${post.owner} has boosted a post to be ${amount} ${token.symbol}!`;
        sendPushNotification("*", createNotificationPayload(title, body));
      }
    }
  }
}

export function handleVaultAdded(event: YieldVaultAdded): void {
  let id = event.params.yieldVaultId.toString();
  let address = event.params.yieldVault;
  let vault = YieldVault.load(id);
  if (vault == null) {
    vault = new YieldVault(id);

    let instance = IYieldVault.bind(address);
    let token = instance.try_token();

    if (!token.reverted) {
      vault.token = getOrCreateToken(token.value).id;
    }

    vault.paused = false;
    vault.save();
  }
}

export function handleVaultPaused(event: YieldVaultPaused): void {
  let vault = YieldVault.load(event.params.yieldVaultId.toString());
  if (vault !== null) {
    vault.paused = event.params.paused;
    vault.save();
  }
}

// Getters
export function getOrCreateUser(id: Address): User {
  let user = User.load(id.toHex());
  if (user == null) {
    user = new User(id.toHex());
    user.save();
  }
  return user;
}

export function getOrCreatePostBoost(
  postId: BigInt,
  vaultId: BigInt
): PostBoost {
  let id = getPostBoostID(postId, vaultId);
  let postBoost = PostBoost.load(id);

  if (postBoost == null) {
    postBoost = new PostBoost(id);
    postBoost.post = postId.toString();
    postBoost.vault = vaultId.toString();
    postBoost.amount = BigInt.fromI32(0);
    postBoost.save();
  }
  return postBoost;
}

export function getOrCreateUserBoost(
  userId: Address,
  vaultId: BigInt
): UserBoost {
  let id = getUserBoostID(userId, vaultId);
  let userBoost = UserBoost.load(id);

  if (userBoost == null) {
    userBoost = new UserBoost(id);
    userBoost.user = userId.toHex();
    userBoost.vault = vaultId.toString();
    userBoost.amount = BigInt.fromI32(0);
    userBoost.save();
  }
  return userBoost;
}

export function getOrCreateToken(id: Address): Token {
  let token = Token.load(id.toHex());
  if (token == null) {
    token = new Token(id.toHex());

    let instance = ERC20.bind(id);
    let symbol = instance.try_symbol();
    let name = instance.try_name();
    let decimals = instance.try_decimals();

    if (!symbol.reverted) {
      token.symbol = symbol.value;
    }
    if (!name.reverted) {
      token.name = name.value;
    }
    if (!decimals.reverted) {
      token.decimals = BigInt.fromI32(decimals.value);
    }

    token.save();
  }
  return token;
}

export function getOrCreateYieldVault(id: Address): YieldVault {
  let vault = YieldVault.load(id.toHex());
  if (vault == null) {
    vault = new YieldVault(id.toHex());

    let instance = IYieldVault.bind(id);
    let token = instance.try_token();

    if (!token.reverted) {
      vault.token = getOrCreateToken(token.value).id;
    }

    vault.paused = false;
    vault.save();
  }
  return vault;
}

// ID Generators
export function getPostBoostID(postId: BigInt, vaultId: BigInt): string {
  return postId.toString() + "-" + vaultId.toString();
}

export function getUserBoostID(userId: Address, vaultId: BigInt): string {
  return userId.toHex() + "-" + vaultId.toString();
}

// Utils
function exponentToBigInt(decimals: BigInt): BigInt {
  let ZERO_BI = BigInt.fromI32(0);
  let ONE_BI = BigInt.fromI32(1);

  let bd = BigInt.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigInt.fromString("10"));
  }
  return bd;
}
