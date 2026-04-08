export type UserDto = {
  id: string;
  firstName: string;
  email: string;
  username: string;
  isDonor: boolean;
  isAdmin: boolean;
};

export type AuthResponse = {
  token: string;
  user: UserDto;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5180";

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function apiRegister(input: {
  firstName: string;
  email: string;
  username: string;
  password: string;
  isDonor: boolean;
  isAdmin: boolean;
  adminCode?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return (await res.json()) as AuthResponse;
}

export async function apiLogin(input: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return (await res.json()) as AuthResponse;
}

export async function apiGetMe(token: string): Promise<UserDto> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return (await res.json()) as UserDto;
}

export type SafehouseOccupancy = {
  name: string;
  occupancy: number;
  capacity: number;
};

export type ImpactStats = {
  activeResidents: number;
  totalResidents: number;
  reintegrationProgressCount: number;
  totalContributionsValue: number;
  uniqueSuporters: number;
  safehouseOccupancy: SafehouseOccupancy[];
  residentsByYear: { year: number; count: number }[];
  reintegrationBreakdown: { status: string; count: number }[];
  donationBreakdown: { type: string; totalValue: number }[];
};

export async function apiGetImpactStats(live = false): Promise<ImpactStats> {
  const res = await fetch(`${API_URL}/api/impact/stats${live ? '?live=true' : ''}`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ImpactStats;
}

export type DonationDto = {
  donationId: number;
  donationDate: string;
  donationType: string;
  amount: number | null;
  currencyCode: string | null;
  notes: string | null;
  channelSource: string | null;
};

export async function apiListDonorDonations(token: string): Promise<DonationDto[]> {
  const res = await fetch(`${API_URL}/api/donor/donations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as DonationDto[];
}

export async function apiCreateDonorDonation(
  token: string,
  body: { amount: number; notes?: string; currencyCode?: string },
): Promise<DonationDto> {
  const res = await fetch(`${API_URL}/api/donor/donations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as DonationDto;
}

// ── ML / Admin ────────────────────────────────────────────────────────────────

export type NotebookStatus = {
  notebook: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
};

export type MlStatusResponse = {
  isRefreshing: boolean;
  notebooks: NotebookStatus[];
};

export type MlDomainSummary = {
  domain: string;
  summary: string;
  refreshedAt: string;
};

export type MlPrediction = {
  id: number;
  notebook: string;
  recordId: string;
  recordType: string;
  label: string;
  score: number | null;
  tier: string | null;
  metaJson: string | null;
  refreshedAt: string;
};

export type MlPredictionsResponse = {
  notebook: string;
  totalCount: number;
  page: number;
  pageSize: number;
  records: MlPrediction[];
};

export async function apiGetMlStatus(token: string): Promise<MlStatusResponse> {
  const res = await fetch(`${API_URL}/api/ml/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MlStatusResponse;
}

export async function apiPostMlRefresh(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/ml/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 409) throw new Error(await readErrorMessage(res));
}

export async function apiPostMlRetrain(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/ml/retrain`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 409) throw new Error(await readErrorMessage(res));
}

export async function apiGetMlSummaries(token: string): Promise<MlDomainSummary[]> {
  const res = await fetch(`${API_URL}/api/ml/summaries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MlDomainSummary[];
}

export async function apiGetMlPredictions(
  token: string,
  notebook: string,
  page = 1,
  pageSize = 10,
  all = false,
): Promise<MlPredictionsResponse> {
  const params = all ? `?all=true` : `?page=${page}&pageSize=${pageSize}`;
  const res = await fetch(`${API_URL}/api/ml/predictions/${notebook}${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MlPredictionsResponse;
}
