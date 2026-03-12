import { getAddress, isAddress } from "viem";
import { abi } from "@/contracts/abi";
import dbConnect from "@/lib/db";
import { redis } from "@/lib/upstash";
import User from "@/models/User";

const allowedDropContracts = new Set(
  [
    abi.JesseDrop.address,
    abi.TOSHIDrop.address,
    abi.MONDrop.address,
    abi.WCTDrop.address,
    abi.DONUTDrop.address,
    abi.CELODrop.address,
    abi.ARBDrop.address,
    abi.OPDrop.address,
    abi.ExclusiveUSDCDrop.address,
  ].map((address) => address.toLowerCase()),
);

type SecurityCheckInput = {
  fid: number;
  userAddress: string;
  contract: string;
  ip: string;
};

type DropSecurityFailure = {
  ok: false;
  status: number;
  error: string;
};

type DropSecuritySuccess = {
  ok: true;
  userAddress: `0x${string}`;
  contract: `0x${string}`;
};

export type DropSecurityResult = DropSecurityFailure | DropSecuritySuccess;

function getClientIp(ipHeader: string | null) {
  return ipHeader?.split(",")[0]?.trim() || "unknown";
}

async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (current > limit) {
    return false;
  }

  return true;
}

export function getRequestIp(headers: Headers) {
  return getClientIp(headers.get("x-forwarded-for"));
}

export async function runDropSecurityChecks({
  fid,
  userAddress,
  contract,
  ip,
}: SecurityCheckInput): Promise<DropSecurityResult> {
  if (!isAddress(userAddress)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid wallet address",
    };
  }

  if (!isAddress(contract)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid contract address",
    };
  }

  const normalizedUserAddress = getAddress(userAddress);
  const normalizedContract = getAddress(contract).toLowerCase();

  if (!allowedDropContracts.has(normalizedContract)) {
    return {
      ok: false,
      status: 403,
      error: "Contract is not allowed",
    };
  }

  await dbConnect();
  const user = await User.findOne({ fid }).lean<{ address?: string } | null>();
  if (!user?.address) {
    return {
      ok: false,
      status: 403,
      error: "Wallet is not linked to this Farcaster account",
    };
  }

  let normalizedStoredAddress: string;
  try {
    normalizedStoredAddress = getAddress(user.address);
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Stored wallet address is invalid",
    };
  }

  if (normalizedStoredAddress !== normalizedUserAddress) {
    return {
      ok: false,
      status: 403,
      error: "Wallet does not match the linked Farcaster account",
    };
  }

  try {
    const minuteWindow = 60;
    const hourWindow = 60 * 60;
    const limits = await Promise.all([
      consumeRateLimit(`sig:fid:${fid}`, 8, minuteWindow),
      consumeRateLimit(`sig:wallet:${normalizedUserAddress.toLowerCase()}`, 8, minuteWindow),
      consumeRateLimit(`sig:ip:${ip}`, 20, minuteWindow),
      consumeRateLimit(`sig:fid-hour:${fid}`, 40, hourWindow),
    ]);

    if (limits.includes(false)) {
      return {
        ok: false,
        status: 429,
        error: "Too many signature requests. Please try again later.",
      };
    }
  } catch {
    return {
      ok: false,
      status: 503,
      error: "Rate limit service unavailable",
    };
  }

  return {
    ok: true as const,
    userAddress: normalizedUserAddress,
    contract: normalizedContract as `0x${string}`,
  };
}
