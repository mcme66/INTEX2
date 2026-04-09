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

export async function apiUpdateProfile(
  token: string,
  input: {
    firstName: string;
    email: string;
    username: string;
    currentPassword?: string;
    newPassword?: string;
  },
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return (await res.json()) as AuthResponse;
}

export type SafehouseOccupancy = {
  name: string;
  occupancy: number;
  capacity: number;
};

function toFrontendSafehouseName(name: string): string {
  return name.replace(/^Lighthouse Safehouse\b/i, "NorthStar Safehouse");
}

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
  donationsByYear: { year: number; totalValue: number }[];
  totalVolunteerHours: number;
  avgDonationPerIndividual: number;
  avgDonationPerOrganization: number;
};

export async function apiGetImpactStats(live = false): Promise<ImpactStats> {
  const res = await fetch(`${API_URL}/api/impact/stats${live ? '?live=true' : ''}`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as ImpactStats;
  return {
    ...data,
    safehouseOccupancy: data.safehouseOccupancy.map((safehouse) => ({
      ...safehouse,
      name: toFrontendSafehouseName(safehouse.name),
    })),
  };
}

export type DonationDto = {
  donationId: number;
  donationDate: string;
  donationType: string;
  amount: number | null;
  estimatedValue: number | null;
  impactUnit: string | null;
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
  body: {
    donationType: string;
    amount?: number;
    estimatedValue?: number;
    impactUnit?: string;
    notes?: string;
    currencyCode?: string;
  },
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

export async function apiUpdateDonorDonation(
  token: string,
  id: number,
  body: {
    donationType: string;
    amount?: number;
    estimatedValue?: number;
    impactUnit?: string;
    notes?: string;
    currencyCode?: string;
  },
): Promise<DonationDto> {
  const res = await fetch(`${API_URL}/api/donor/donations/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as DonationDto;
}

export async function apiDeleteDonorDonation(
  token: string,
  id: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/donor/donations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
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
  sort = "score_desc",
): Promise<MlPredictionsResponse> {
  const params = all ? `?all=true&sort=${sort}` : `?page=${page}&pageSize=${pageSize}&sort=${sort}`;
  const res = await fetch(`${API_URL}/api/ml/predictions/${notebook}${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MlPredictionsResponse;
}

// ── ML Artifacts ─────────────────────────────────────────────────────────────

export async function apiGetMlArtifact<T = unknown>(
  token: string,
  domain: string,
  filename: string,
): Promise<T> {
  const res = await fetch(`${API_URL}/api/ml/artifacts/${domain}/${filename}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as T;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export type MonthlyDonation = { month: string; donationType: string; totalValue: number };
export type SafehousePerformance = {
  safehouseId: number; name: string; capacity: number; occupancy: number;
  activeResidents: number; closedCases: number; reintegratedCount: number;
  incidentCount: number; reintegrationRate: number;
};
export type MonthlyResident = { month: string; admissions: number; closures: number };

export async function apiGetMonthlyDonations(token: string): Promise<MonthlyDonation[]> {
  const res = await fetch(`${API_URL}/api/analytics/monthly-donations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MonthlyDonation[];
}

export async function apiGetSafehousePerformance(token: string): Promise<SafehousePerformance[]> {
  const res = await fetch(`${API_URL}/api/analytics/safehouse-performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as SafehousePerformance[];
  return data.map((safehouse) => ({
    ...safehouse,
    name: toFrontendSafehouseName(safehouse.name),
  }));
}

export async function apiGetMonthlyResidents(token: string): Promise<MonthlyResident[]> {
  const res = await fetch(`${API_URL}/api/analytics/monthly-residents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MonthlyResident[];
}

// ── Services, Beneficiaries, Outcomes ─────────────────────────────────────────

export type ServiceTotals = { totalCaring: number; totalHealing: number; totalTeaching: number };
export type MonthlyService = { month: string; caring: number; healing: number; teaching: number };
export type ServicesProvidedResponse = { totals: ServiceTotals; monthly: MonthlyService[] };

export type SafehouseBeneficiaryCount = { name: string; count: number };
export type CategoryCount = { category: string; count: number };
export type BeneficiarySummary = {
  totalServed: number; currentlyActive: number; closedCases: number; reintegrated: number;
  bySafehouse: SafehouseBeneficiaryCount[]; byCategory: CategoryCount[];
};

export type MonthlyEducation = { month: string; avgAttendance: number; avgProgress: number };
export type EnrollmentCount = { status: string; count: number };
export type EducationOutcomesResponse = {
  monthly: MonthlyEducation[]; enrollment: EnrollmentCount[];
  overallAvgAttendance: number; overallAvgProgress: number;
};

export type MonthlyHealth = { month: string; avgHealth: number; avgNutrition: number; avgSleep: number };
export type HealthOutcomesResponse = {
  monthly: MonthlyHealth[];
  overallAvgHealth: number; overallAvgNutrition: number; overallAvgSleep: number;
  medicalCheckupPct: number; dentalCheckupPct: number; psychCheckupPct: number;
};

export async function apiGetServicesProvided(token: string): Promise<ServicesProvidedResponse> {
  const res = await fetch(`${API_URL}/api/analytics/services-provided`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ServicesProvidedResponse;
}

export async function apiGetBeneficiarySummary(token: string): Promise<BeneficiarySummary> {
  const res = await fetch(`${API_URL}/api/analytics/beneficiary-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as BeneficiarySummary;
  return {
    ...data,
    bySafehouse: data.bySafehouse.map((safehouse) => ({
      ...safehouse,
      name: toFrontendSafehouseName(safehouse.name),
    })),
  };
}

export async function apiGetEducationOutcomes(token: string): Promise<EducationOutcomesResponse> {
  const res = await fetch(`${API_URL}/api/analytics/education-outcomes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as EducationOutcomesResponse;
}

export async function apiGetHealthOutcomes(token: string): Promise<HealthOutcomesResponse> {
  const res = await fetch(`${API_URL}/api/analytics/health-outcomes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as HealthOutcomesResponse;
}

// ── Residents / Caseload ──────────────────────────────────────────────────────

export type ResidentListItem = {
  residentId: number;
  caseControlNo: string | null;
  internalCode: string | null;
  safehouseId: number | null;
  caseStatus: string | null;
  sex: string | null;
  dateOfBirth: string | null;
  caseCategory: string | null;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  isPwd: boolean;
  pwdType: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsDiagnosis: string | null;
  familyIs4Ps: boolean;
  familySoloParent: boolean;
  familyIndigenous: boolean;
  familyParentPwd: boolean;
  familyInformalSettler: boolean;
  dateOfAdmission: string | null;
  ageUponAdmission: string | null;
  presentAge: string | null;
  lengthOfStay: string | null;
  referralSource: string | null;
  referringAgencyPerson: string | null;
  assignedSocialWorker: string | null;
  initialCaseAssessment: string | null;
  reintegrationType: string | null;
  reintegrationStatus: string | null;
  initialRiskLevel: string | null;
  currentRiskLevel: string | null;
  dateEnrolled: string | null;
  dateClosed: string | null;
};

export type ResidentListResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: ResidentListItem[];
};

export type ResidentFilterOptions = {
  statuses: string[];
  categories: string[];
  safehouseIds: number[];
  reintegrationStatuses: string[];
  socialWorkers: string[];
};

export type ResidentUpsertRequest = {
  caseControlNo?: string | null;
  internalCode?: string | null;
  safehouseId?: number | null;
  caseStatus?: string | null;
  sex?: string | null;
  dateOfBirth?: string | null;
  birthStatus?: string | null;
  placeOfBirth?: string | null;
  religion?: string | null;
  caseCategory?: string | null;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  isPwd: boolean;
  pwdType?: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsDiagnosis?: string | null;
  familyIs4Ps: boolean;
  familySoloParent: boolean;
  familyIndigenous: boolean;
  familyParentPwd: boolean;
  familyInformalSettler: boolean;
  dateOfAdmission?: string | null;
  ageUponAdmission?: string | null;
  presentAge?: string | null;
  lengthOfStay?: string | null;
  referralSource?: string | null;
  referringAgencyPerson?: string | null;
  dateColbRegistered?: string | null;
  dateColbObtained?: string | null;
  assignedSocialWorker?: string | null;
  initialCaseAssessment?: string | null;
  dateCaseStudyPrepared?: string | null;
  reintegrationType?: string | null;
  reintegrationStatus?: string | null;
  initialRiskLevel?: string | null;
  currentRiskLevel?: string | null;
  dateEnrolled?: string | null;
  dateClosed?: string | null;
  notesRestricted?: string | null;
};

export async function apiListResidents(
  token: string,
  params: {
    status?: string;
    safehouseId?: number;
    category?: string;
    search?: string;
    reintegrationStatus?: string;
    socialWorker?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<ResidentListResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.safehouseId) qs.set("safehouseId", params.safehouseId.toString());
  if (params.category) qs.set("category", params.category);
  if (params.search) qs.set("search", params.search);
  if (params.reintegrationStatus) qs.set("reintegrationStatus", params.reintegrationStatus);
  if (params.socialWorker) qs.set("socialWorker", params.socialWorker);
  qs.set("page", (params.page ?? 1).toString());
  qs.set("pageSize", (params.pageSize ?? 25).toString());

  const res = await fetch(`${API_URL}/api/residents?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ResidentListResponse;
}

export async function apiGetResidentFilters(token: string): Promise<ResidentFilterOptions> {
  const res = await fetch(`${API_URL}/api/residents/filters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ResidentFilterOptions;
}

export async function apiCreateResident(token: string, body: ResidentUpsertRequest): Promise<ResidentListItem> {
  const res = await fetch(`${API_URL}/api/residents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ResidentListItem;
}

export async function apiUpdateResident(token: string, id: number, body: ResidentUpsertRequest): Promise<ResidentListItem> {
  const res = await fetch(`${API_URL}/api/residents/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ResidentListItem;
}

export async function apiDeleteResident(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/residents/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

// ── Process Recordings ────────────────────────────────────────────────────────

export type ProcessRecordingDto = {
  recordingId: number;
  residentId: number;
  residentCode: string | null;
  sessionDate: string | null;
  socialWorker: string | null;
  sessionType: string | null;
  sessionDurationMinutes: number | null;
  emotionalStateObserved: string | null;
  emotionalStateEnd: string | null;
  sessionNarrative: string | null;
  interventionsApplied: string | null;
  followUpActions: string | null;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
};

export type ProcessRecordingListResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: ProcessRecordingDto[];
};

export type ProcessRecordingFilterOptions = {
  socialWorkers: string[];
  sessionTypes: string[];
  residents: { residentId: number; label: string }[];
};

export type ProcessRecordingUpsertRequest = {
  residentId: number;
  sessionDate?: string | null;
  socialWorker?: string | null;
  sessionType?: string | null;
  sessionDurationMinutes?: number | null;
  emotionalStateObserved?: string | null;
  emotionalStateEnd?: string | null;
  sessionNarrative?: string | null;
  interventionsApplied?: string | null;
  followUpActions?: string | null;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
  notesRestricted?: string | null;
};

export async function apiListProcessRecordings(
  token: string,
  params: {
    residentId?: number;
    socialWorker?: string;
    sessionType?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<ProcessRecordingListResponse> {
  const qs = new URLSearchParams();
  if (params.residentId) qs.set("residentId", params.residentId.toString());
  if (params.socialWorker) qs.set("socialWorker", params.socialWorker);
  if (params.sessionType) qs.set("sessionType", params.sessionType);
  if (params.search) qs.set("search", params.search);
  qs.set("page", (params.page ?? 1).toString());
  qs.set("pageSize", (params.pageSize ?? 25).toString());
  const res = await fetch(`${API_URL}/api/processrecordings?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ProcessRecordingListResponse;
}

export async function apiGetProcessRecordingFilters(token: string): Promise<ProcessRecordingFilterOptions> {
  const res = await fetch(`${API_URL}/api/processrecordings/filters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ProcessRecordingFilterOptions;
}

export async function apiCreateProcessRecording(token: string, body: ProcessRecordingUpsertRequest): Promise<ProcessRecordingDto> {
  const res = await fetch(`${API_URL}/api/processrecordings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ProcessRecordingDto;
}

export async function apiUpdateProcessRecording(token: string, id: number, body: ProcessRecordingUpsertRequest): Promise<ProcessRecordingDto> {
  const res = await fetch(`${API_URL}/api/processrecordings/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ProcessRecordingDto;
}

export async function apiDeleteProcessRecording(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/processrecordings/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

// ── Home Visitations ──────────────────────────────────────────────────────────

export type HomeVisitationDto = {
  visitationId: number;
  residentId: number;
  residentCode: string | null;
  visitDate: string | null;
  socialWorker: string | null;
  visitType: string | null;
  locationVisited: string | null;
  familyMembersPresent: string | null;
  purpose: string | null;
  observations: string | null;
  familyCooperationLevel: string | null;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes: string | null;
  visitOutcome: string | null;
};

export type HomeVisitationListResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: HomeVisitationDto[];
};

export type HomeVisitationFilterOptions = {
  visitTypes: string[];
  socialWorkers: string[];
  outcomes: string[];
  cooperationLevels: string[];
  residents: { residentId: number; label: string }[];
};

export type HomeVisitationUpsertRequest = {
  residentId: number;
  visitDate?: string | null;
  socialWorker?: string | null;
  visitType?: string | null;
  locationVisited?: string | null;
  familyMembersPresent?: string | null;
  purpose?: string | null;
  observations?: string | null;
  familyCooperationLevel?: string | null;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes?: string | null;
  visitOutcome?: string | null;
};

export async function apiListHomeVisitations(
  token: string,
  params: {
    residentId?: number;
    visitType?: string;
    socialWorker?: string;
    safetyConcerns?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<HomeVisitationListResponse> {
  const qs = new URLSearchParams();
  if (params.residentId) qs.set("residentId", params.residentId.toString());
  if (params.visitType) qs.set("visitType", params.visitType);
  if (params.socialWorker) qs.set("socialWorker", params.socialWorker);
  if (params.safetyConcerns !== undefined) qs.set("safetyConcerns", params.safetyConcerns.toString());
  if (params.search) qs.set("search", params.search);
  qs.set("page", (params.page ?? 1).toString());
  qs.set("pageSize", (params.pageSize ?? 25).toString());
  const res = await fetch(`${API_URL}/api/homevisitations?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as HomeVisitationListResponse;
}

export async function apiGetHomeVisitationFilters(token: string): Promise<HomeVisitationFilterOptions> {
  const res = await fetch(`${API_URL}/api/homevisitations/filters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as HomeVisitationFilterOptions;
}

export async function apiCreateHomeVisitation(token: string, body: HomeVisitationUpsertRequest): Promise<HomeVisitationDto> {
  const res = await fetch(`${API_URL}/api/homevisitations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as HomeVisitationDto;
}

export async function apiUpdateHomeVisitation(token: string, id: number, body: HomeVisitationUpsertRequest): Promise<HomeVisitationDto> {
  const res = await fetch(`${API_URL}/api/homevisitations/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as HomeVisitationDto;
}

export async function apiDeleteHomeVisitation(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/homevisitations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

// ── Intervention Plans (Case Conferences) ────────────────────────────────────

export type InterventionPlanDto = {
  planId: number;
  residentId: number;
  residentCode: string | null;
  planCategory: string | null;
  planDescription: string | null;
  servicesProvided: string | null;
  targetValue: number | null;
  targetDate: string | null;
  status: string | null;
  caseConferenceDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type InterventionPlanListResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: InterventionPlanDto[];
};

export type InterventionPlanFilterOptions = {
  statuses: string[];
  categories: string[];
  residents: { residentId: number; label: string }[];
};

export type InterventionPlanUpsertRequest = {
  residentId: number;
  planCategory?: string | null;
  planDescription?: string | null;
  servicesProvided?: string | null;
  targetValue?: number | null;
  targetDate?: string | null;
  status?: string | null;
  caseConferenceDate?: string | null;
};

export async function apiListInterventionPlans(
  token: string,
  params: {
    residentId?: number;
    status?: string;
    category?: string;
    upcoming?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<InterventionPlanListResponse> {
  const qs = new URLSearchParams();
  if (params.residentId) qs.set("residentId", params.residentId.toString());
  if (params.status) qs.set("status", params.status);
  if (params.category) qs.set("category", params.category);
  if (params.upcoming !== undefined) qs.set("upcoming", params.upcoming.toString());
  if (params.search) qs.set("search", params.search);
  qs.set("page", (params.page ?? 1).toString());
  qs.set("pageSize", (params.pageSize ?? 50).toString());
  const res = await fetch(`${API_URL}/api/interventionplans?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as InterventionPlanListResponse;
}

export async function apiGetInterventionPlanFilters(token: string): Promise<InterventionPlanFilterOptions> {
  const res = await fetch(`${API_URL}/api/interventionplans/filters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as InterventionPlanFilterOptions;
}

export async function apiCreateInterventionPlan(token: string, body: InterventionPlanUpsertRequest): Promise<InterventionPlanDto> {
  const res = await fetch(`${API_URL}/api/interventionplans`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as InterventionPlanDto;
}

export async function apiUpdateInterventionPlan(token: string, id: number, body: InterventionPlanUpsertRequest): Promise<InterventionPlanDto> {
  const res = await fetch(`${API_URL}/api/interventionplans/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as InterventionPlanDto;
}

export async function apiDeleteInterventionPlan(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/interventionplans/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
