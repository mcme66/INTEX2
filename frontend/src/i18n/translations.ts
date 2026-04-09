// ─────────────────────────────────────────────────────────────────────────────
// Translation strings for every UI surface in the app.
// Add keys here, then add the corresponding value to both `en` and `es`.
// ─────────────────────────────────────────────────────────────────────────────

export type Translations = {
  // ── Navbar ─────────────────────────────────────────────────────────────────
  navHome: string;
  navImpact: string;
  navWaysToHelp: string;
  navDonorDashboard: string;
  navAdminDashboard: string;
  navSignOut: string;
  navRegister: string;
  navLogin: string;
  // Profile panel
  navEditProfile: string;
  profileName: string;
  profileEmail: string;
  profileUsername: string;
  profileChangePassword: string;
  profileCurrentPassword: string;
  profileNewPassword: string;
  profileConfirmNewPassword: string;
  profileRequiredToChange: string;
  profileMinSixChars: string;
  profileReEnter: string;
  profileCancel: string;
  profileSave: string;
  profileSaving: string;
  profileUpdated: string;
  profileErrName: string;
  profileErrUsername: string;
  profileErrEmail: string;
  profileErrCurrentPwd: string;
  profileErrNewPwdLen: string;
  profileErrPwdMismatch: string;
  profileErrFailed: string;
  // ── Footer ─────────────────────────────────────────────────────────────────
  footerTagline: string;
  footerOrganization: string;
  footerHome: string;
  footerOurMission: string;
  footerOurImpact: string;
  footerGetInvolved: string;
  footerDonate: string;
  footerVolunteer: string;
  footerContact: string;
  footerPrivacyPolicy: string;
  // ── Cookie consent ─────────────────────────────────────────────────────────
  cookieTitle: string;
  cookieDesc: string;
  cookiePrivacyPolicy: string;
  cookieReject: string;
  cookieAccept: string;
  // ── Home page ──────────────────────────────────────────────────────────────
  homeHeroHeadline: string;
  homeHeroSub: string;
  homeWaysToHelp: string;
  homeLearnMore: string;
  homeMissionLabel: string;
  homeMissionHeadline: string;
  homeMissionP1: string;
  homeMissionP2: string;
  homeSafeHousesTitle: string;
  homeSafeHousesDesc: string;
  homeTraumaTitle: string;
  homeTraumaDesc: string;
  homeReintegrationTitle: string;
  homeReintegrationDesc: string;
  homeStatChildren: string;
  homeStatSafehouses: string;
  homeStatReintegration: string;
  homeStatRaised: string;
  homeGetInvolved: string;
  homeHowHelp: string;
  homeGiveMonthly: string;
  homeGiveMonthlyDesc: string;
  homeStartGiving: string;
  homeVolunteerSkills: string;
  homeVolunteerSkillsDesc: string;
  homeSeeOpportunities: string;
  homeCorporatePartnership: string;
  homeCorporatePartnershipDesc: string;
  homePartnerWithUs: string;
  homeCtaHeadline: string;
  homeCtaSub: string;
  homeCtaBtn: string;
  // ── Impact page ────────────────────────────────────────────────────────────
  impactLabel: string;
  impactTitle: string;
  impactSub: string;
  impactRefresh: string;
  impactRefreshing: string;
  impactLoading: string;
  impactChildrenInCare: string;
  impactChildrenTotal: string;
  impactReintegrationRate: string;
  impactActiveSupporters: string;
  impactOutcomes: string;
  impactReintegrationProgress: string;
  impactReintegrationProgressDesc: string;
  impactChildrenAdmitted: string;
  impactChildrenAdmittedDesc: string;
  impactResources: string;
  impactContributionsByType: string;
  impactContributionsByTypeDesc: string;
  impactContributionsOverTime: string;
  impactContributionsOverTimeDesc: string;
  impactVolunteerHours: string;
  impactVolunteerHoursUnit: string;
  impactVolunteerHoursDesc: string;
  impactPrivacyNote: string;
  // ── Volunteer / Ways to Help page ──────────────────────────────────────────
  volunteerLabel: string;
  volunteerHeadline: string;
  volunteerSub: string;
  volunteerCommitmentLabel: string;
  volunteerCommitmentText: string;
  volunteerViewImpact: string;
  volunteerGetInvolved: string;
  volunteerSixWays: string;
  volunteerWay1Title: string;
  volunteerWay1Desc: string;
  volunteerWay2Title: string;
  volunteerWay2Desc: string;
  volunteerWay3Title: string;
  volunteerWay3Desc: string;
  volunteerWay4Title: string;
  volunteerWay4Desc: string;
  volunteerWay5Title: string;
  volunteerWay5Desc: string;
  volunteerWay6Title: string;
  volunteerWay6Desc: string;
  volunteerNotSure: string;
  volunteerNotSureDesc: string;
  volunteerCreateAccount: string;
  // ── Login page ─────────────────────────────────────────────────────────────
  loginHeadline: string;
  loginSub: string;
  loginSignIn: string;
  loginAccessTools: string;
  loginUsernameLabel: string;
  loginPasswordLabel: string;
  loginSigningIn: string;
  loginSignInBtn: string;
  loginCreateAccount: string;
  // ── Register page ──────────────────────────────────────────────────────────
  registerHeadline: string;
  registerSub: string;
  registerCardTitle: string;
  registerAllAccounts: string;
  registerFirstName: string;
  registerEmail: string;
  registerUsername: string;
  registerPassword: string;
  registerPasswordMin: string;
  registerVerifyPassword: string;
  registerHasCode: string;
  registerCodeLabel: string;
  registerCodePlaceholder: string;
  registerCreating: string;
  registerCreateAccount: string;
  registerBackToLogin: string;
  registerErrPwdShort: string;
  registerErrPwdMismatch: string;
  registerErrEnterCode: string;
  registerErrFailed: string;
  registerPwdMismatchInline: string;
  // ── Privacy page ───────────────────────────────────────────────────────────
  privacyLabel: string;
  privacyTitle: string;
  privacySub: string;
  privacyCookieText: string;
  privacySection1Title: string;
  privacySection1Text: string;
  privacySection2Title: string;
  privacySection2Text: string;
  privacySection3Title: string;
  privacySection3Text: string;
  privacySection4Title: string;
  privacySection4Text: string;
  // ── Not Found page ─────────────────────────────────────────────────────────
  notFoundHeadline: string;
  notFoundReturn: string;
  // ── Donor Dashboard ────────────────────────────────────────────────────────
  donorWelcome: string;
  donorSub: string;
  donorTotalGiven: string;
  donorDonations: string;
  donorActiveMonths: string;
  donorLastGift: string;
  donorYourImpact: string;
  donorImpactDesc: string;
  donorMostRecent: string;
  donorNoContributions: string;
  donorWhatHelps: string;
  donorSupportInAction: string;
  donorSafeHousing: string;
  donorSafeHousingDesc: string;
  donorMeals: string;
  donorMealsDesc: string;
  donorEducation: string;
  donorEducationDesc: string;
  donorCounseling: string;
  donorCounselingDesc: string;
  donorMakeADonation: string;
  donorMakeADonationDesc: string;
  donorTypeOfContribution: string;
  donorMonetary: string;
  donorVolunteerTime: string;
  donorSkillsServices: string;
  donorInKindGoods: string;
  donorSocialMedia: string;
  donorAmount: string;
  donorNumHours: string;
  donorNumItems: string;
  donorNumPosts: string;
  donorCurrency: string;
  donorUSD: string;
  donorCOP: string;
  donorDescribeContribution: string;
  donorNoteOptional: string;
  donorSkillsPlaceholder: string;
  donorNotePlaceholder: string;
  donorProcessing: string;
  donorDonateNow: string;
  donorLogContribution: string;
  donorDonationHistory: string;
  donorHistoryDesc: string;
  donorLoading: string;
  donorNoDonations: string;
  donorDateCol: string;
  donorTypeCol: string;
  donorContributionCol: string;
  donorNoteCol: string;
  donorEditDonation: string;
  donorEditDesc: string;
  donorTypeEditLabel: string;
  donorDelete: string;
  donorCancel: string;
  donorSaveChanges: string;
  donorSavingChanges: string;
  donorDeleteDonation: string;
  donorDeleteConfirm: string;
  donorDateLabel: string;
  donorTypeLabelInline: string;
  donorAmountLabel: string;
  donorNoteLabelInline: string;
  donorDeleting: string;
  donorToastSuccess: string;
  donorToastUpdated: string;
  donorToastDeleted: string;
  donorToastErrValue: string;
  donorToastErrSkills: string;
  donorToastErrSave: string;
  donorToastErrUpdate: string;
  donorToastErrDelete: string;
  donorToastErrLoad: string;
  donorToastErrSkillsEdit: string;
  // ── Admin Dashboard ────────────────────────────────────────────────────────
  adminTitle: string;
  adminDesc: string;
  adminKeyMetrics: string;
  adminRefresh: string;
  adminRefreshing: string;
  adminChildrenInCare: string;
  adminTotalContributions: string;
  adminReintegrationRate: string;
  adminActiveSupporters: string;
  adminSafeHouseOccupancy: string;
  adminLinkMlReports: string;
  adminLinkMlReportsDesc: string;
  adminLinkCaseload: string;
  adminLinkCaseloadDesc: string;
  adminLinkProcessRecording: string;
  adminLinkProcessRecordingDesc: string;
  adminLinkVisits: string;
  adminLinkVisitsDesc: string;
  adminLinkDonorMgmt: string;
  adminLinkDonorMgmtDesc: string;
  // ── Caseload page ──────────────────────────────────────────────────────────
  caseloadTitle: string;
  caseloadBackToDashboard: string;
  caseloadSearch: string;
  caseloadSearchPlaceholder: string;
  caseloadClearSearch: string;
  caseloadAddResident: string;
  caseloadName: string;
  caseloadSafehouse: string;
  caseloadStatus: string;
  caseloadRisk: string;
  caseloadAge: string;
  caseloadAdmitted: string;
  caseloadSubcategories: string;
  caseloadNoResults: string;
  caseloadLoading: string;
  caseloadEdit: string;
  caseloadDelete: string;
  caseloadSave: string;
  caseloadCancel: string;
  caseloadPrev: string;
  caseloadNext: string;
  caseloadAddTitle: string;
  caseloadEditTitle: string;
  caseloadDeleteTitle: string;
  caseloadDeleteConfirm: string;
  caseloadFilters: string;
  // ── Process Recording page ─────────────────────────────────────────────────
  processTitle: string;
  processBackToDashboard: string;
  processSearch: string;
  processSearchPlaceholder: string;
  processAddRecord: string;
  processDate: string;
  processType: string;
  processWorker: string;
  processSafehouse: string;
  processResident: string;
  processSummary: string;
  processActions: string;
  processNoResults: string;
  processLoading: string;
  processEdit: string;
  processDelete: string;
  processSave: string;
  processCancel: string;
  processAddTitle: string;
  processEditTitle: string;
  processDeleteTitle: string;
  processDeleteConfirm: string;
  // ── Home Visitation page ───────────────────────────────────────────────────
  visitTitle: string;
  visitBackToDashboard: string;
  visitSearch: string;
  visitSearchPlaceholder: string;
  visitAddVisit: string;
  visitDate: string;
  visitType: string;
  visitWorker: string;
  visitResident: string;
  visitSummary: string;
  visitSafetyConcerns: string;
  visitFollowUp: string;
  visitActions: string;
  visitNoResults: string;
  visitLoading: string;
  visitEdit: string;
  visitDelete: string;
  visitSave: string;
  visitCancel: string;
  visitAddTitle: string;
  visitEditTitle: string;
  visitDeleteTitle: string;
  visitDeleteConfirm: string;
  // ── Reports page ───────────────────────────────────────────────────────────
  reportsTitle: string;
  reportsBackToDashboard: string;
  reportsLoading: string;
  reportsNoData: string;
  // ── Donors (admin) page ────────────────────────────────────────────────────
  donorsTitle: string;
  donorsBackToDashboard: string;
  donorsSearch: string;
  donorsSearchPlaceholder: string;
  donorsAddDonor: string;
  donorsName: string;
  donorsEmail: string;
  donorsPhone: string;
  donorsType: string;
  donorsStatus: string;
  donorsTotalGiven: string;
  donorsContributions: string;
  donorsNoResults: string;
  donorsLoading: string;
  donorsEdit: string;
  donorsDelete: string;
  donorsSave: string;
  donorsCancel: string;
  donorsAddTitle: string;
  donorsEditTitle: string;
  donorsDeleteTitle: string;
  donorsDeleteConfirm: string;
  // ── Caseload page (extra) ──────────────────────────────────────────────────
  caseloadSubtitle: string;
  caseloadNewRecord: string;
  caseloadNewResidentRecord: string;
  caseloadNoRecordsFound: string;
  caseloadCaseNo: string;
  caseloadCategory: string;
  caseloadSocialWorker: string;
  caseloadReintegration: string;
  caseloadAllStatuses: string;
  caseloadAllSafehouses: string;
  caseloadAllCategories: string;
  caseloadAllReintegration: string;
  caseloadAllSocialWorkers: string;
  caseloadClearFilters: string;
  // ── Process Recording page (extra) ────────────────────────────────────────
  processSubtitle: string;
  processNewSession: string;
  processSearchDetailed: string;
  processNoRecordingsFound: string;
  // ── Home Visitation page (extra) ──────────────────────────────────────────
  visitFullTitle: string;
  visitSubtitle: string;
  visitLogVisit: string;
  visitNewConference: string;
  visitHomeVisitsTab: string;
  visitConferencesTab: string;
  // ── Reports page (extra) ──────────────────────────────────────────────────
  reportsFullTitle: string;
  reportsSubtitleText: string;
  reportsTabAnalytics: string;
  reportsTabLookup: string;
  reportsTabInsights: string;
  // ── Donors (admin) page (extra) ───────────────────────────────────────────
  donorsContributionsTitle: string;
  donorsManageDesc: string;
  donorsViewDesc: string;
  donorsAddSupporter: string;
  donorsOpenDashboard: string;
  donorsStaffLogin: string;
  donorsLoadingText: string;
  // ── Donors admin extras (table / forms) ────────────────────────────────────
  donorsSupporter: string;
  donorsAllTypes: string;
  donorsAllStatuses: string;
  donorsActiveStatus: string;
  donorsInactiveStatus: string;
  donorsClearFilters: string;
  donorsNoSupporters: string;
  donorsDonationAllocations: string;
  donorsRestrictedText: string;
  donorsNewSupporter: string;
  donorsSupporterDetails: string;
  donorsFirstName: string;
  donorsLastName: string;
  donorsSupporterType: string;
  donorsDeleteSupporter: string;
  donorsSaveSupporter: string;
  donorsDeletingText: string;
  donorsContribHistory: string;
  donorsLogContribution: string;
  donorsDate: string;
  donorsAmountValue: string;
  donorsProgramArea: string;
  donorsNotesDesc: string;
  donorsNoContributions: string;
  donorsNoEmail: string;
  donorsSearchNameEmail: string;
  // ── Reports analytics tab ──────────────────────────────────────────────────
  reportsActiveResidents: string;
  reportsKpiTotal: string;
  reportsKpiSupporters: string;
  reportsKpiInProgress: string;
  reportsVolunteerHours: string;
  reportsServicesProvided: string;
  reportsCaring: string;
  reportsHealing: string;
  reportsTeaching: string;
  reportsBeneficiaryCounts: string;
  reportsTotalServed: string;
  reportsActiveLabel: string;
  reportsClosed: string;
  reportsReintegrated: string;
  reportsEducationOutcomes: string;
  reportsAvgAttendance: string;
  reportsAvgProgress: string;
  reportsHealthWellbeing: string;
  reportsGeneralHealth: string;
  reportsNutrition: string;
  reportsSleepQuality: string;
  reportsExcellent: string;
  reportsGood: string;
  reportsFair: string;
  reportsNeedsImprovement: string;
  reportsCheckupCompletion: string;
  reportsMedical: string;
  reportsDental: string;
  reportsPsychological: string;
  reportsDonationTrends: string;
  reportsNoDonationData: string;
  reportsContributionsByType: string;
  reportsSafehousePerf: string;
  reportsPercentFull: string;
  reportsActiveSmall: string;
  reportsReintegSmall: string;
  reportsIncidents: string;
  reportsReintegrationStatus: string;
  reportsAdmissionsClosures: string;
  reportsAdmissionsLegend: string;
  reportsClosuresLegend: string;
  reportsLoadingAnalytics: string;
  reportsCouldNotLoad: string;
  // ── Reports insights / lookup tab ─────────────────────────────────────────
  reportsMlLastUpdated: string;
  reportsRefreshPredictions: string;
  reportsFullRetrain: string;
  reportsRunning: string;
  reportsAnalysisLabel: string;
  reportsPredictionLabel: string;
  reportsAnalysisSummary: string;
  reportsActionableRecs: string;
  reportsPredictionRecords: string;
  reportsViewAll: string;
  reportsClose: string;
  reportsAllRecords: string;
  reportsRecordCol: string;
  reportsTypeCol: string;
  reportsPrevious: string;
  reportsNextPage: string;
  reportsTotal: string;
  reportsPage: string;
  reportsOf: string;
  reportsNoPredictions: string;
  reportsLoadingDots: string;
  reportsLoadingRecords: string;
  reportsNoRecordsFound: string;
  reportsSelectRecord: string;
  reportsRecordType: string;
  reportsRecordId: string;
  reportsScoreGauge: string;
  reportsLastScored: string;
  reportsSearchByName: string;
  reportsSelectDomainDesc: string;
  // ── ML Domain translations ─────────────────────────────────────────────────
  domainDonorAcqLabel: string;
  domainDonorAcqScoreLabel: string;
  domainDonorAcqTierLabel: string;
  domainDonorAcqDesc: string;
  domainDonorAcqRec1: string;
  domainDonorAcqRec2: string;
  domainDonorChurnLabel: string;
  domainDonorChurnScoreLabel: string;
  domainDonorChurnTierLabel: string;
  domainDonorChurnDesc: string;
  domainDonorChurnRec1: string;
  domainDonorChurnRec2: string;
  domainIncidentLabel: string;
  domainIncidentScoreLabel: string;
  domainIncidentTierLabel: string;
  domainIncidentDesc: string;
  domainIncidentRec1: string;
  domainIncidentRec2: string;
  domainReintLabel: string;
  domainReintScoreLabel: string;
  domainReintTierLabel: string;
  domainReintDesc: string;
  domainReintRec1: string;
  domainReintRec2: string;
  domainSocialMediaLabel: string;
  domainSocialMediaScoreLabel: string;
  domainSocialMediaTierLabel: string;
  domainSocialMediaDesc: string;
  domainSocialMediaRec1: string;
  domainSocialMediaRec2: string;
  domainVolunteerLabel: string;
  domainVolunteerScoreLabel: string;
  domainVolunteerTierLabel: string;
  domainVolunteerDesc: string;
  domainVolunteerRec1: string;
  domainVolunteerRec2: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// English
// ─────────────────────────────────────────────────────────────────────────────
export const en: Translations = {
  // Navbar
  navHome: "Home",
  navImpact: "Our Impact",
  navWaysToHelp: "Ways to Help",
  navDonorDashboard: "Donor Dashboard",
  navAdminDashboard: "Admin Dashboard",
  navSignOut: "Sign out",
  navRegister: "Register",
  navLogin: "Login",
  navEditProfile: "Edit Profile",
  profileName: "Name",
  profileEmail: "Email",
  profileUsername: "Username",
  profileChangePassword: "Change Password",
  profileCurrentPassword: "Current Password",
  profileNewPassword: "New Password",
  profileConfirmNewPassword: "Confirm New Password",
  profileRequiredToChange: "Required to change password",
  profileMinSixChars: "Min 6 characters",
  profileReEnter: "Re-enter new password",
  profileCancel: "Cancel",
  profileSave: "Save",
  profileSaving: "Saving...",
  profileUpdated: "Profile updated!",
  profileErrName: "Name must be at least 2 characters.",
  profileErrUsername: "Username must be at least 3 characters.",
  profileErrEmail: "Enter a valid email address.",
  profileErrCurrentPwd: "Enter your current password.",
  profileErrNewPwdLen: "New password must be at least 6 characters.",
  profileErrPwdMismatch: "New passwords do not match.",
  profileErrFailed: "Update failed.",
  // Footer
  footerTagline: "Providing refuge, healing, and hope to trafficked and abused children in Colombia.",
  footerOrganization: "Organization",
  footerHome: "Home",
  footerOurMission: "Our Mission",
  footerOurImpact: "Our Impact",
  footerGetInvolved: "Get Involved",
  footerDonate: "Donate",
  footerVolunteer: "Volunteer",
  footerContact: "Contact",
  footerPrivacyPolicy: "Privacy Policy",
  // Cookie consent
  cookieTitle: "We use cookies",
  cookieDesc:
    "This site uses essential cookies required for login and core functionality. With your consent we may also activate optional analytics cookies to understand how the site is used — no personal data is sold or shared with third parties. See our Privacy Policy for details. You can change your preference at any time by clearing your browser's local storage.",
  cookiePrivacyPolicy: "Privacy Policy",
  cookieReject: "Reject",
  cookieAccept: "Accept",
  // Home page
  homeHeroHeadline: "Every child deserves a safe place to heal.",
  homeHeroSub:
    "North Star provides refuge, restoration, and long-term care for children rescued from trafficking and abuse in Colombia.",
  homeWaysToHelp: "Ways to Help",
  homeLearnMore: "Learn More",
  homeMissionLabel: "Our Mission",
  homeMissionHeadline: "Restoring childhood, one life at a time",
  homeMissionP1:
    "In Colombia, thousands of children are victims of sexual trafficking and abuse each year. Many have nowhere to turn. North Star operates safe houses where rescued children receive trauma-informed care, education, and the stability they need to rebuild their lives.",
  homeMissionP2:
    "We work alongside Colombian authorities, local communities, and international partners to identify at-risk children, provide immediate refuge, and support long-term recovery through counseling, education, and vocational training.",
  homeSafeHousesTitle: "Safe Houses",
  homeSafeHousesDesc:
    "Secure residential facilities staffed 24/7 with trained caregivers, therapists, and educators in multiple Colombian cities.",
  homeTraumaTitle: "Trauma Recovery",
  homeTraumaDesc:
    "Licensed counselors provide individual and group therapy using evidence-based approaches tailored to each child's needs.",
  homeReintegrationTitle: "Reintegration",
  homeReintegrationDesc:
    "Education, life skills, and vocational training to help older youth transition toward independence with dignity.",
  homeStatChildren: "Children in our care",
  homeStatSafehouses: "Safe houses across Colombia",
  homeStatReintegration: "Successful reintegration rate",
  homeStatRaised: "Raised for children in need",
  homeGetInvolved: "Get Involved",
  homeHowHelp: "How you can help",
  homeGiveMonthly: "Give Monthly",
  homeGiveMonthlyDesc:
    "Consistent funding allows us to plan long-term care. $50/month covers a child's food and schooling for 30 days.",
  homeStartGiving: "Start Giving",
  homeVolunteerSkills: "Volunteer Your Skills",
  homeVolunteerSkillsDesc:
    "We need therapists, teachers, translators, grant writers, and tech professionals. Remote and on-site roles available.",
  homeSeeOpportunities: "See Opportunities",
  homeCorporatePartnership: "Corporate Partnership",
  homeCorporatePartnershipDesc:
    "Align your organization with our mission. We offer sponsorship tiers, impact reports, and co-branded campaigns.",
  homePartnerWithUs: "Partner With Us",
  homeCtaHeadline: "Be their North Star.",
  homeCtaSub:
    "Every contribution—whether financial, professional, or personal—directly changes a child's life. Join us.",
  homeCtaBtn: "Get Involved",
  // Impact page
  impactLabel: "Transparency & Accountability",
  impactTitle: "Our Impact",
  impactSub:
    "Aggregated, anonymized data showing outcomes, progress, and resource use across all program areas.",
  impactRefresh: "Refresh",
  impactRefreshing: "Refreshing…",
  impactLoading: "Loading stats…",
  impactChildrenInCare: "Children Currently in Care",
  impactChildrenTotal: "Children Supported in Total",
  impactReintegrationRate: "Reintegration Rate",
  impactActiveSupporters: "Active Supporters",
  impactOutcomes: "Outcomes",
  impactReintegrationProgress: "Reintegration Progress",
  impactReintegrationProgressDesc:
    "How children are progressing toward returning to a safe family environment.",
  impactChildrenAdmitted: "Children Admitted by Year",
  impactChildrenAdmittedDesc:
    "Growth in the number of children reached through our program over time.",
  impactResources: "Resources",
  impactContributionsByType: "Contributions by Type",
  impactContributionsByTypeDesc:
    "How supporters contribute — including monetary gifts, in-kind donations, and volunteered time.",
  impactContributionsOverTime: "Contributions Over Time",
  impactContributionsOverTimeDesc:
    "Total estimated value of all contributions received each year.",
  impactVolunteerHours: "Volunteer Hours Contributed",
  impactVolunteerHoursUnit: "hrs",
  impactVolunteerHoursDesc: "Combined hours donated by volunteers and skilled contributors.",
  impactPrivacyNote:
    "All data is aggregated and anonymized to protect the privacy and safety of the children in our care.",
  // Volunteer / Ways to Help page
  volunteerLabel: "Get Involved",
  volunteerHeadline: "There are many ways to stand with these children.",
  volunteerSub:
    "Whether you give financially, offer your time, contribute professional skills, or simply amplify our message — every form of support directly changes the trajectory of a child's life.",
  volunteerCommitmentLabel: "Our commitment",
  volunteerCommitmentText:
    "North Star operates with full transparency. Every contribution — monetary, in-kind, or in service — is tracked, reported, and directed to the programs that need it most.",
  volunteerViewImpact: "View our impact",
  volunteerGetInvolved: "Get involved",
  volunteerSixWays: "Six ways to make a difference",
  volunteerWay1Title: "Make a Monetary Donation",
  volunteerWay1Desc:
    "Fund safe housing, meals, counseling, and education for children in our care.",
  volunteerWay2Title: "Volunteer Your Time",
  volunteerWay2Desc:
    "Mentor, tutor, or lead activities in our safehouses. Consistent presence matters deeply.",
  volunteerWay3Title: "Contribute Skills & Services",
  volunteerWay3Desc:
    "Medical, legal, counseling, education, and tech professionals can give their expertise directly.",
  volunteerWay4Title: "In-Kind Donations",
  volunteerWay4Desc: "Clothing, school supplies, hygiene products, and food are always needed.",
  volunteerWay5Title: "Become a Partner Organization",
  volunteerWay5Desc:
    "Churches, businesses, and nonprofits can build sustained partnerships aligned with our mission.",
  volunteerWay6Title: "Advocate on Social Media",
  volunteerWay6Desc:
    "Share our mission and impact stories to grow awareness and bring in new supporters.",
  volunteerNotSure: "Not sure where to start?",
  volunteerNotSureDesc:
    "Create an account and our team will help you find the right fit for your capacity and interests.",
  volunteerCreateAccount: "Create an account",
  // Login page
  loginHeadline: "Sign in to the North Star internal workspace.",
  loginSub:
    "Welcome back. Sign in to track your giving history, manage your donation preferences, and see the direct impact your contributions are making for children in Colombia.",
  loginSignIn: "Sign in",
  loginAccessTools: "Access donor and admin tools.",
  loginUsernameLabel: "Username",
  loginPasswordLabel: "Password",
  loginSigningIn: "Signing in...",
  loginSignInBtn: "Sign in",
  loginCreateAccount: "Create account",
  // Register page
  registerHeadline: "Create an account to get involved with North Star.",
  registerSub:
    "Sign up to track your giving history, manage your donation preferences, and see the direct impact your contributions are making for children in Colombia.",
  registerCardTitle: "Register",
  registerAllAccounts: "All accounts receive donor access by default.",
  registerFirstName: "First name",
  registerEmail: "Email",
  registerUsername: "Username",
  registerPassword: "Password",
  registerPasswordMin: "Must be at least 14 characters.",
  registerVerifyPassword: "Verify Password",
  registerHasCode: "Do you have a registration code?",
  registerCodeLabel: "Registration code",
  registerCodePlaceholder: "Enter your code",
  registerCreating: "Creating...",
  registerCreateAccount: "Create account",
  registerBackToLogin: "Back to login",
  registerErrPwdShort: "Password must be at least 14 characters.",
  registerErrPwdMismatch: "Passwords do not match.",
  registerErrEnterCode: "Please enter your registration code.",
  registerErrFailed: "Registration failed",
  registerPwdMismatchInline: "Passwords do not match.",
  // Privacy page
  privacyLabel: "Privacy Policy",
  privacyTitle: "Privacy and cookie use",
  privacySub:
    "This project keeps the original policy intent from the previous frontend while fitting it into the current visual system.",
  privacyCookieText:
    "Essential cookies support login state and site function. On your first visit a consent banner is shown where you can accept or reject optional analytics cookies. Your choice is stored in your browser's localStorage under the key cookie_consent and the banner will not appear again. You can withdraw or change your choice at any time by clearing your browser's local storage for this site.",
  privacySection1Title: "What data we collect",
  privacySection1Text:
    "North Star may collect contact details submitted by staff users, account login credentials, donor records entered by administrators, and site usage information through optional analytics cookies.",
  privacySection2Title: "How data is used",
  privacySection2Text:
    "We use data to manage staff access, maintain donor and contribution records, understand which parts of the site are useful, and communicate with users who request updates or support.",
  privacySection3Title: "How data is stored",
  privacySection3Text:
    "Account and supporter records are stored in protected application databases with access limited to authorized staff. Analytics preferences are stored locally in your browser.",
  privacySection4Title: "Your rights",
  privacySection4Text:
    "Users may request access to personal data, correction of inaccurate information, deletion where appropriate, and withdrawal of consent for non-essential cookies.",
  // Not Found page
  notFoundHeadline: "Oops! Page not found",
  notFoundReturn: "Return to Home",
  // Donor Dashboard
  donorWelcome: "Welcome back",
  donorSub:
    "Track your giving history, see the impact of your contributions, and continue making a difference for children in Colombia.",
  donorTotalGiven: "Total Given",
  donorDonations: "Donations",
  donorActiveMonths: "Active Months",
  donorLastGift: "Last Gift",
  donorYourImpact: "Your Impact",
  donorImpactDesc:
    "Every donation helps fund safe housing, meals, education, and counseling for children in North Star's care.",
  donorMostRecent: "Most Recent Contribution",
  donorNoContributions: "No contributions recorded yet.",
  donorWhatHelps: "What your contributions help provide",
  donorSupportInAction: "Support in action",
  donorSafeHousing: "Safe housing",
  donorSafeHousingDesc: "A secure home environment",
  donorMeals: "Meals & nutrition",
  donorMealsDesc: "Daily meals for children",
  donorEducation: "Education",
  donorEducationDesc: "School supplies & tutoring",
  donorCounseling: "Counseling",
  donorCounselingDesc: "Therapeutic support sessions",
  donorMakeADonation: "Make a Donation",
  donorMakeADonationDesc:
    "Submit a donation to support North Star's mission. No real payment is processed — this is a demo environment.",
  donorTypeOfContribution: "Type of Contribution",
  donorMonetary: "Monetary",
  donorVolunteerTime: "Volunteer Time",
  donorSkillsServices: "Skills & Services",
  donorInKindGoods: "In-Kind Goods",
  donorSocialMedia: "Social Media",
  donorAmount: "Amount",
  donorNumHours: "Number of Hours",
  donorNumItems: "Number of Items",
  donorNumPosts: "Number of Posts",
  donorCurrency: "Currency",
  donorUSD: "USD — US Dollar",
  donorCOP: "COP — Colombian Peso",
  donorDescribeContribution: "Describe Your Contribution",
  donorNoteOptional: "Note (optional)",
  donorSkillsPlaceholder: "e.g. Legal consultation, tutoring, medical screening…",
  donorNotePlaceholder: "In honor of…",
  donorProcessing: "Processing…",
  donorDonateNow: "Donate Now",
  donorLogContribution: "Log Contribution",
  donorDonationHistory: "Donation History",
  donorHistoryDesc: "A complete record of every contribution tied to your account.",
  donorLoading: "Loading…",
  donorNoDonations: "No donations yet. When you submit a gift above, it will appear here.",
  donorDateCol: "Date",
  donorTypeCol: "Type",
  donorContributionCol: "Contribution",
  donorNoteCol: "Note",
  donorEditDonation: "Edit Donation",
  donorEditDesc: "Update the details for this contribution, or delete it.",
  donorTypeEditLabel: "Type",
  donorDelete: "Delete",
  donorCancel: "Cancel",
  donorSaveChanges: "Save Changes",
  donorSavingChanges: "Saving…",
  donorDeleteDonation: "Delete Donation",
  donorDeleteConfirm:
    "This action cannot be undone. Are you sure you want to delete this donation?",
  donorDateLabel: "Date:",
  donorTypeLabelInline: "Type:",
  donorAmountLabel: "Amount:",
  donorNoteLabelInline: "Note:",
  donorDeleting: "Deleting…",
  donorToastSuccess: "Thank you — your contribution has been recorded.",
  donorToastUpdated: "Donation updated.",
  donorToastDeleted: "Donation deleted.",
  donorToastErrValue: "Enter a valid value greater than zero.",
  donorToastErrSkills: "Please describe the skills or services you contributed.",
  donorToastErrSave: "Contribution could not be saved.",
  donorToastErrUpdate: "Could not update donation.",
  donorToastErrDelete: "Could not delete donation.",
  donorToastErrLoad: "Could not load donations.",
  donorToastErrSkillsEdit: "Please describe the skills or services contributed.",
  // Admin Dashboard
  adminTitle: "Admin Dashboard",
  adminDesc: "Command center for staff managing North Star.",
  adminKeyMetrics: "Key Metrics",
  adminRefresh: "Refresh",
  adminRefreshing: "Refreshing…",
  adminChildrenInCare: "Children Currently in Care",
  adminTotalContributions: "Total Contributions",
  adminReintegrationRate: "Reintegration Rate",
  adminActiveSupporters: "Active Supporters",
  adminSafeHouseOccupancy: "Safe House Occupancy",
  adminLinkMlReports: "ML Reports",
  adminLinkMlReportsDesc:
    "Machine learning insights and predictions across all program areas.",
  adminLinkCaseload: "Caseload Inventory",
  adminLinkCaseloadDesc: "View and manage resident caseloads across safehouses.",
  adminLinkProcessRecording: "Process Recording",
  adminLinkProcessRecordingDesc: "Log and review operational process records.",
  adminLinkVisits: "Visits & Conferences",
  adminLinkVisitsDesc:
    "Log home visits, case conference history, safety concerns, and follow-up actions.",
  adminLinkDonorMgmt: "Donor Management",
  adminLinkDonorMgmtDesc: "View and manage donor records and contribution history.",
  // Caseload page
  caseloadTitle: "Caseload Inventory",
  caseloadBackToDashboard: "Back to Dashboard",
  caseloadSearch: "Search",
  caseloadSearchPlaceholder: "Search residents…",
  caseloadClearSearch: "Clear search",
  caseloadAddResident: "Add Resident",
  caseloadName: "Name",
  caseloadSafehouse: "Safehouse",
  caseloadStatus: "Status",
  caseloadRisk: "Risk",
  caseloadAge: "Age",
  caseloadAdmitted: "Admitted",
  caseloadSubcategories: "Subcategories",
  caseloadNoResults: "No residents found.",
  caseloadLoading: "Loading…",
  caseloadEdit: "Edit",
  caseloadDelete: "Delete",
  caseloadSave: "Save",
  caseloadCancel: "Cancel",
  caseloadPrev: "Previous",
  caseloadNext: "Next",
  caseloadAddTitle: "Add Resident",
  caseloadEditTitle: "Edit Resident",
  caseloadDeleteTitle: "Delete Resident",
  caseloadDeleteConfirm: "Are you sure you want to delete this resident?",
  caseloadFilters: "Filters",
  // Process Recording page
  processTitle: "Process Recording",
  processBackToDashboard: "Back to Dashboard",
  processSearch: "Search",
  processSearchPlaceholder: "Search records…",
  processAddRecord: "Add Record",
  processDate: "Date",
  processType: "Type",
  processWorker: "Worker",
  processSafehouse: "Safehouse",
  processResident: "Resident",
  processSummary: "Summary",
  processActions: "Actions",
  processNoResults: "No records found.",
  processLoading: "Loading…",
  processEdit: "Edit",
  processDelete: "Delete",
  processSave: "Save",
  processCancel: "Cancel",
  processAddTitle: "Add Record",
  processEditTitle: "Edit Record",
  processDeleteTitle: "Delete Record",
  processDeleteConfirm: "Are you sure you want to delete this record?",
  // Home Visitation page
  visitTitle: "Visits & Conferences",
  visitBackToDashboard: "Back to Dashboard",
  visitSearch: "Search",
  visitSearchPlaceholder: "Search visits…",
  visitAddVisit: "Add Visit",
  visitDate: "Date",
  visitType: "Type",
  visitWorker: "Worker",
  visitResident: "Resident",
  visitSummary: "Summary",
  visitSafetyConcerns: "Safety Concerns",
  visitFollowUp: "Follow-up",
  visitActions: "Actions",
  visitNoResults: "No visits found.",
  visitLoading: "Loading…",
  visitEdit: "Edit",
  visitDelete: "Delete",
  visitSave: "Save",
  visitCancel: "Cancel",
  visitAddTitle: "Add Visit",
  visitEditTitle: "Edit Visit",
  visitDeleteTitle: "Delete Visit",
  visitDeleteConfirm: "Are you sure you want to delete this visit?",
  // Reports page
  reportsTitle: "ML Reports",
  reportsBackToDashboard: "Back to Dashboard",
  reportsLoading: "Loading reports…",
  reportsNoData: "No report data available.",
  // Donors (admin) page
  donorsTitle: "Donor Management",
  donorsBackToDashboard: "Back to Dashboard",
  donorsSearch: "Search",
  donorsSearchPlaceholder: "Search donors…",
  donorsAddDonor: "Add Donor",
  donorsName: "Name",
  donorsEmail: "Email",
  donorsPhone: "Phone",
  donorsType: "Type",
  donorsStatus: "Status",
  donorsTotalGiven: "Total Given",
  donorsContributions: "Contributions",
  donorsNoResults: "No donors found.",
  donorsLoading: "Loading…",
  donorsEdit: "Edit",
  donorsDelete: "Delete",
  donorsSave: "Save",
  donorsCancel: "Cancel",
  donorsAddTitle: "Add Donor",
  donorsEditTitle: "Edit Donor",
  donorsDeleteTitle: "Delete Donor",
  donorsDeleteConfirm: "Are you sure you want to delete this donor?",
  // Caseload extras
  caseloadSubtitle: "Resident profiles following Philippine social welfare agency standards.",
  caseloadNewRecord: "New Record",
  caseloadNewResidentRecord: "New Resident Record",
  caseloadNoRecordsFound: "No records found",
  caseloadCaseNo: "Case No.",
  caseloadCategory: "Category",
  caseloadSocialWorker: "Social Worker",
  caseloadReintegration: "Reintegration",
  caseloadAllStatuses: "All statuses",
  caseloadAllSafehouses: "All safehouses",
  caseloadAllCategories: "All categories",
  caseloadAllReintegration: "All reintegration",
  caseloadAllSocialWorkers: "All social workers",
  caseloadClearFilters: "Clear filters",
  // ProcessRecording extras
  processSubtitle: "Counseling session notes documenting each resident's healing journey, recorded chronologically.",
  processNewSession: "New Session",
  processSearchDetailed: "Search resident, worker, narrative…",
  processNoRecordingsFound: "No recordings found",
  // HomeVisitation extras
  visitFullTitle: "Home Visitation & Case Conferences",
  visitSubtitle: "Home and field visit logs, case conference history, and upcoming conferences for each resident.",
  visitLogVisit: "Log Visit",
  visitNewConference: "New Conference",
  visitHomeVisitsTab: "Home Visits",
  visitConferencesTab: "Case Conferences",
  // Reports extras
  reportsFullTitle: "Reports & Analytics",
  reportsSubtitleText: "Aggregated insights, ML predictions, and interactive record exploration.",
  reportsTabAnalytics: "Analytics Dashboard",
  reportsTabLookup: "Record Lookup",
  reportsTabInsights: "ML Insights",
  // Donors admin extras
  donorsContributionsTitle: "Donors & Contributions",
  donorsManageDesc: "Manage supporter records, giving history, and donation allocation details.",
  donorsViewDesc: "A stewardship-first view of where support is going and how the work is sustained.",
  donorsAddSupporter: "Add Supporter",
  donorsOpenDashboard: "Open donor dashboard",
  donorsStaffLogin: "Staff login",
  donorsLoadingText: "Loading supporters...",
  // Donors admin extras (table / forms)
  donorsSupporter: "Supporter",
  donorsAllTypes: "All supporter types",
  donorsAllStatuses: "All statuses",
  donorsActiveStatus: "Active",
  donorsInactiveStatus: "Inactive",
  donorsClearFilters: "Clear filters",
  donorsNoSupporters: "No supporters found matching your criteria.",
  donorsDonationAllocations: "Donation Allocations",
  donorsRestrictedText: "Detailed supporter management remains restricted to admin users. This public-facing version keeps the same design language while exposing only high-level stewardship summaries.",
  donorsNewSupporter: "New Supporter Record",
  donorsSupporterDetails: "Supporter Details",
  donorsFirstName: "First Name",
  donorsLastName: "Last Name",
  donorsSupporterType: "Supporter Type",
  donorsDeleteSupporter: "Delete Supporter",
  donorsSaveSupporter: "Save Supporter",
  donorsDeletingText: "Deleting…",
  donorsContribHistory: "Contribution History",
  donorsLogContribution: "Log Contribution",
  donorsDate: "Date",
  donorsAmountValue: "Amount/Value ($)",
  donorsProgramArea: "Program Area",
  donorsNotesDesc: "Notes / Description",
  donorsNoContributions: "No contributions recorded.",
  donorsNoEmail: "No email on file",
  donorsSearchNameEmail: "Search name or email...",
  // Reports analytics tab
  reportsActiveResidents: "Active Residents",
  reportsKpiTotal: "total",
  reportsKpiSupporters: "supporters",
  reportsKpiInProgress: "in progress",
  reportsVolunteerHours: "Volunteer Hours",
  reportsServicesProvided: "Services Provided",
  reportsCaring: "Caring",
  reportsHealing: "Healing",
  reportsTeaching: "Teaching",
  reportsBeneficiaryCounts: "Beneficiary Counts",
  reportsTotalServed: "Total Served",
  reportsActiveLabel: "Active",
  reportsClosed: "Closed",
  reportsReintegrated: "Reintegrated",
  reportsEducationOutcomes: "Education Outcomes",
  reportsAvgAttendance: "Avg Attendance",
  reportsAvgProgress: "Avg Progress",
  reportsHealthWellbeing: "Health & Wellbeing",
  reportsGeneralHealth: "General Health",
  reportsNutrition: "Nutrition",
  reportsSleepQuality: "Sleep Quality",
  reportsExcellent: "Excellent",
  reportsGood: "Good",
  reportsFair: "Fair",
  reportsNeedsImprovement: "Needs Improvement",
  reportsCheckupCompletion: "Checkup Completion",
  reportsMedical: "Medical",
  reportsDental: "Dental",
  reportsPsychological: "Psychological",
  reportsDonationTrends: "Donation Trends",
  reportsNoDonationData: "No donation data available.",
  reportsContributionsByType: "Contributions by Type",
  reportsSafehousePerf: "Safehouse Performance",
  reportsPercentFull: "% full",
  reportsActiveSmall: "active",
  reportsReintegSmall: "reinteg.",
  reportsIncidents: "incidents",
  reportsReintegrationStatus: "Reintegration Status",
  reportsAdmissionsClosures: "Admissions & Closures",
  reportsAdmissionsLegend: "Admissions",
  reportsClosuresLegend: "Closures",
  reportsLoadingAnalytics: "Loading analytics…",
  reportsCouldNotLoad: "Could not load analytics data.",
  // Reports insights / lookup tab
  reportsMlLastUpdated: "ML last updated:",
  reportsRefreshPredictions: "Refresh predictions",
  reportsFullRetrain: "Full retrain",
  reportsRunning: "Running…",
  reportsAnalysisLabel: "Analysis",
  reportsPredictionLabel: "Prediction",
  reportsAnalysisSummary: "Analysis Summary",
  reportsActionableRecs: "Actionable Recommendations",
  reportsPredictionRecords: "Prediction Records",
  reportsViewAll: "View all",
  reportsClose: "Close",
  reportsAllRecords: "All Records",
  reportsRecordCol: "Record",
  reportsTypeCol: "Type",
  reportsPrevious: "Previous",
  reportsNextPage: "Next",
  reportsTotal: "total",
  reportsPage: "page",
  reportsOf: "of",
  reportsNoPredictions: "No predictions yet — run a refresh to generate scores.",
  reportsLoadingDots: "Loading…",
  reportsLoadingRecords: "Loading records…",
  reportsNoRecordsFound: "No records found.",
  reportsSelectRecord: "Select a record to view details",
  reportsRecordType: "Record Type",
  reportsRecordId: "Record ID",
  reportsScoreGauge: "Score Gauge",
  reportsLastScored: "Last scored:",
  reportsSearchByName: "Search by name or ID…",
  reportsSelectDomainDesc: "Select a domain and search for a specific record to view its detailed prediction. This uses existing scored data from the most recent model run.",
  // ML Domain translations
  domainDonorAcqLabel: "Donor Acquisition",
  domainDonorAcqScoreLabel: "Acquisition probability",
  domainDonorAcqTierLabel: "Risk tier",
  domainDonorAcqDesc: "Identifies which new donors are most likely to become recurring givers within 12 months.",
  domainDonorAcqRec1: "Prioritize outreach to organizational donors and partner-referred contacts — these profiles are most strongly associated with becoming long-term, high-value supporters.",
  domainDonorAcqRec2: "Track engagement within the first 90 days: donors who interact multiple times early are significantly more likely to convert to recurring givers.",
  domainDonorChurnLabel: "Donor Churn",
  domainDonorChurnScoreLabel: "Churn probability",
  domainDonorChurnTierLabel: "Risk tier",
  domainDonorChurnDesc: "Predicts which active donors are at risk of stopping their giving within 90 days.",
  domainDonorChurnRec1: "Flag donors who haven't given in 60+ days for personal outreach — recency of last gift is the strongest predictor of churn risk.",
  domainDonorChurnRec2: "Pay special attention to donors who came through partner referrals, as their initial engagement channel influences long-term retention.",
  domainIncidentLabel: "Incident Risk",
  domainIncidentScoreLabel: "Severity probability",
  domainIncidentTierLabel: "Attention tier",
  domainIncidentDesc: "Flags residents at elevated risk of a high-severity incident in the next 30 days.",
  domainIncidentRec1: "Review all intervention plans monthly and prioritize immediate follow-up on stalled safety-category plans.",
  domainIncidentRec2: "Ensure no gap longer than 14 days between counseling sessions for residents with flagged concerns.",
  domainReintLabel: "Reintegration Readiness",
  domainReintScoreLabel: "Readiness score",
  domainReintTierLabel: "Pathway",
  domainReintDesc: "Assesses which residents are ready for reintegration and predicts the most likely pathway.",
  domainReintRec1: "Monitor health trends closely — an improving composite health trajectory is the strongest indicator that a resident is ready for reintegration.",
  domainReintRec2: "Keep education attendance above 75% before scheduling reintegration assessments, as attendance trends are a key predictor of readiness.",
  domainSocialMediaLabel: "Social Media Impact",
  domainSocialMediaScoreLabel: "Conversion probability",
  domainSocialMediaTierLabel: "Value tier",
  domainSocialMediaDesc: "Predicts which social media posts are most likely to drive donations.",
  domainSocialMediaRec1: "Feature resident stories in your posts — this content type drives both donation conversion and donation value more than any other factor.",
  domainSocialMediaRec2: "Schedule event promotions and impact stories during evening hours on Instagram for the highest conversion rates.",
  domainVolunteerLabel: "Volunteer Engagement",
  domainVolunteerScoreLabel: "Growth potential",
  domainVolunteerTierLabel: "Status",
  domainVolunteerDesc: "Identifies volunteers likely to grow their engagement vs. those at risk of dropping out.",
  domainVolunteerRec1: "Re-engage inactive volunteers (50% of the base) with personal outreach and barrier-removal campaigns — even small wins can reactivate them.",
  domainVolunteerRec2: "Retain top-performing volunteers with exclusive leadership roles and recognition events — they represent only 12.5% but generate the highest engagement value.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Spanish
// ─────────────────────────────────────────────────────────────────────────────
export const es: Translations = {
  // Navbar
  navHome: "Inicio",
  navImpact: "Nuestro Impacto",
  navWaysToHelp: "Formas de Ayudar",
  navDonorDashboard: "Panel del Donante",
  navAdminDashboard: "Panel de Administración",
  navSignOut: "Cerrar sesión",
  navRegister: "Registrarse",
  navLogin: "Iniciar sesión",
  navEditProfile: "Editar Perfil",
  profileName: "Nombre",
  profileEmail: "Correo electrónico",
  profileUsername: "Nombre de usuario",
  profileChangePassword: "Cambiar Contraseña",
  profileCurrentPassword: "Contraseña actual",
  profileNewPassword: "Nueva contraseña",
  profileConfirmNewPassword: "Confirmar nueva contraseña",
  profileRequiredToChange: "Requerida para cambiar contraseña",
  profileMinSixChars: "Mín. 6 caracteres",
  profileReEnter: "Reingrese la nueva contraseña",
  profileCancel: "Cancelar",
  profileSave: "Guardar",
  profileSaving: "Guardando...",
  profileUpdated: "¡Perfil actualizado!",
  profileErrName: "El nombre debe tener al menos 2 caracteres.",
  profileErrUsername: "El nombre de usuario debe tener al menos 3 caracteres.",
  profileErrEmail: "Ingrese un correo electrónico válido.",
  profileErrCurrentPwd: "Ingrese su contraseña actual.",
  profileErrNewPwdLen: "La nueva contraseña debe tener al menos 6 caracteres.",
  profileErrPwdMismatch: "Las nuevas contraseñas no coinciden.",
  profileErrFailed: "Error al actualizar.",
  // Footer
  footerTagline:
    "Brindando refugio, sanación y esperanza a niños víctimas de trata y abuso en Colombia.",
  footerOrganization: "Organización",
  footerHome: "Inicio",
  footerOurMission: "Nuestra Misión",
  footerOurImpact: "Nuestro Impacto",
  footerGetInvolved: "Involúcrese",
  footerDonate: "Donar",
  footerVolunteer: "Voluntariado",
  footerContact: "Contacto",
  footerPrivacyPolicy: "Política de Privacidad",
  // Cookie consent
  cookieTitle: "Usamos cookies",
  cookieDesc:
    "Este sitio usa cookies esenciales para el inicio de sesión y las funciones básicas. Con su consentimiento también podemos activar cookies de análisis opcionales para entender cómo se usa el sitio — no se venden ni comparten datos personales con terceros. Consulte nuestra Política de Privacidad para más detalles. Puede cambiar su preferencia en cualquier momento borrando el almacenamiento local de su navegador.",
  cookiePrivacyPolicy: "Política de Privacidad",
  cookieReject: "Rechazar",
  cookieAccept: "Aceptar",
  // Home page
  homeHeroHeadline: "Cada niño merece un lugar seguro para sanar.",
  homeHeroSub:
    "North Star brinda refugio, restauración y atención a largo plazo a niños rescatados de la trata y el abuso en Colombia.",
  homeWaysToHelp: "Formas de Ayudar",
  homeLearnMore: "Conocer Más",
  homeMissionLabel: "Nuestra Misión",
  homeMissionHeadline: "Restaurando la niñez, una vida a la vez",
  homeMissionP1:
    "En Colombia, miles de niños son víctimas de trata sexual y abuso cada año. Muchos no tienen adónde ir. North Star opera casas seguras donde los niños rescatados reciben atención especializada en trauma, educación y la estabilidad que necesitan para reconstruir sus vidas.",
  homeMissionP2:
    "Trabajamos junto a las autoridades colombianas, las comunidades locales y los socios internacionales para identificar a los niños en riesgo, brindarles refugio inmediato y apoyar la recuperación a largo plazo mediante orientación, educación y formación vocacional.",
  homeSafeHousesTitle: "Casas Seguras",
  homeSafeHousesDesc:
    "Instalaciones residenciales seguras con personal las 24 horas, los 7 días, con cuidadores, terapeutas y educadores capacitados en varias ciudades colombianas.",
  homeTraumaTitle: "Recuperación del Trauma",
  homeTraumaDesc:
    "Consejeros certificados brindan terapia individual y grupal usando enfoques basados en evidencia adaptados a las necesidades de cada niño.",
  homeReintegrationTitle: "Reinserción",
  homeReintegrationDesc:
    "Educación, habilidades para la vida y formación vocacional para ayudar a los jóvenes mayores a transitar hacia la independencia con dignidad.",
  homeStatChildren: "Niños bajo nuestro cuidado",
  homeStatSafehouses: "Casas seguras en Colombia",
  homeStatReintegration: "Tasa de reinserción exitosa",
  homeStatRaised: "Recaudado para niños en necesidad",
  homeGetInvolved: "Involúcrese",
  homeHowHelp: "Cómo puede ayudar",
  homeGiveMonthly: "Done Mensualmente",
  homeGiveMonthlyDesc:
    "El financiamiento constante nos permite planificar la atención a largo plazo. $50 al mes cubre la alimentación y la escolaridad de un niño durante 30 días.",
  homeStartGiving: "Comenzar a Donar",
  homeVolunteerSkills: "Ofrece tus Habilidades",
  homeVolunteerSkillsDesc:
    "Necesitamos terapeutas, maestros, traductores, redactores de subvenciones y profesionales de tecnología. Roles remotos y presenciales disponibles.",
  homeSeeOpportunities: "Ver Oportunidades",
  homeCorporatePartnership: "Alianza Corporativa",
  homeCorporatePartnershipDesc:
    "Alinee su organización con nuestra misión. Ofrecemos niveles de patrocinio, informes de impacto y campañas de co-branding.",
  homePartnerWithUs: "Aliarse con Nosotros",
  homeCtaHeadline: "Sé su Estrella del Norte.",
  homeCtaSub:
    "Cada contribución — ya sea financiera, profesional o personal — cambia directamente la vida de un niño. Únase a nosotros.",
  homeCtaBtn: "Involúcrese",
  // Impact page
  impactLabel: "Transparencia y Rendición de Cuentas",
  impactTitle: "Nuestro Impacto",
  impactSub:
    "Datos agregados y anonimizados que muestran resultados, progreso y uso de recursos en todas las áreas del programa.",
  impactRefresh: "Actualizar",
  impactRefreshing: "Actualizando…",
  impactLoading: "Cargando estadísticas…",
  impactChildrenInCare: "Niños Actualmente en Cuidado",
  impactChildrenTotal: "Niños Apoyados en Total",
  impactReintegrationRate: "Tasa de Reinserción",
  impactActiveSupporters: "Donantes Activos",
  impactOutcomes: "Resultados",
  impactReintegrationProgress: "Progreso de Reinserción",
  impactReintegrationProgressDesc:
    "Cómo progresan los niños hacia el regreso a un entorno familiar seguro.",
  impactChildrenAdmitted: "Niños Admitidos por Año",
  impactChildrenAdmittedDesc:
    "Crecimiento en el número de niños atendidos a través de nuestro programa a lo largo del tiempo.",
  impactResources: "Recursos",
  impactContributionsByType: "Contribuciones por Tipo",
  impactContributionsByTypeDesc:
    "Cómo contribuyen los donantes — incluyendo donaciones monetarias, donaciones en especie y tiempo voluntariado.",
  impactContributionsOverTime: "Contribuciones a lo Largo del Tiempo",
  impactContributionsOverTimeDesc:
    "Valor total estimado de todas las contribuciones recibidas cada año.",
  impactVolunteerHours: "Horas de Voluntariado Contribuidas",
  impactVolunteerHoursUnit: "hrs",
  impactVolunteerHoursDesc:
    "Horas combinadas donadas por voluntarios y colaboradores especializados.",
  impactPrivacyNote:
    "Todos los datos se agregan y anonimizan para proteger la privacidad y seguridad de los niños bajo nuestro cuidado.",
  // Volunteer / Ways to Help page
  volunteerLabel: "Involúcrese",
  volunteerHeadline: "Hay muchas formas de apoyar a estos niños.",
  volunteerSub:
    "Ya sea que done dinero, ofrezca su tiempo, contribuya con habilidades profesionales o simplemente amplifique nuestro mensaje — cada forma de apoyo cambia directamente el rumbo de la vida de un niño.",
  volunteerCommitmentLabel: "Nuestro compromiso",
  volunteerCommitmentText:
    "North Star opera con total transparencia. Cada contribución — monetaria, en especie o en servicio — es rastreada, reportada y dirigida a los programas que más la necesitan.",
  volunteerViewImpact: "Ver nuestro impacto",
  volunteerGetInvolved: "Involúcrese",
  volunteerSixWays: "Seis formas de hacer la diferencia",
  volunteerWay1Title: "Hacer una Donación Monetaria",
  volunteerWay1Desc:
    "Financie vivienda segura, alimentación, orientación y educación para los niños bajo nuestro cuidado.",
  volunteerWay2Title: "Ofrece tu Tiempo",
  volunteerWay2Desc:
    "Sea mentor, tutor o líder de actividades en nuestras casas seguras. La presencia constante importa profundamente.",
  volunteerWay3Title: "Contribuir con Habilidades y Servicios",
  volunteerWay3Desc:
    "Los profesionales médicos, legales, de orientación, educación y tecnología pueden aportar su experiencia directamente.",
  volunteerWay4Title: "Donaciones en Especie",
  volunteerWay4Desc: "Siempre se necesitan ropa, útiles escolares, productos de higiene y alimentos.",
  volunteerWay5Title: "Convertirse en Organización Aliada",
  volunteerWay5Desc:
    "Iglesias, empresas y organizaciones sin fines de lucro pueden construir alianzas sostenidas alineadas con nuestra misión.",
  volunteerWay6Title: "Promover en Redes Sociales",
  volunteerWay6Desc:
    "Comparta nuestra misión e historias de impacto para generar conciencia y atraer nuevos donantes.",
  volunteerNotSure: "¿No sabe por dónde empezar?",
  volunteerNotSureDesc:
    "Cree una cuenta y nuestro equipo le ayudará a encontrar el rol adecuado según su capacidad e intereses.",
  volunteerCreateAccount: "Crear una cuenta",
  // Login page
  loginHeadline: "Inicie sesión en el espacio de trabajo interno de North Star.",
  loginSub:
    "Bienvenido de nuevo. Inicie sesión para rastrear su historial de donaciones, gestionar sus preferencias de donación y ver el impacto directo de sus contribuciones en los niños de Colombia.",
  loginSignIn: "Iniciar sesión",
  loginAccessTools: "Accede a herramientas para donantes y administradores.",
  loginUsernameLabel: "Nombre de usuario",
  loginPasswordLabel: "Contraseña",
  loginSigningIn: "Iniciando sesión...",
  loginSignInBtn: "Iniciar sesión",
  loginCreateAccount: "Crear cuenta",
  // Register page
  registerHeadline: "Cree una cuenta para involucrarse con North Star.",
  registerSub:
    "Regístrese para rastrear su historial de donaciones, gestionar sus preferencias de donación y ver el impacto directo de sus contribuciones en los niños de Colombia.",
  registerCardTitle: "Registrarse",
  registerAllAccounts: "Todas las cuentas reciben acceso de donante por defecto.",
  registerFirstName: "Nombre",
  registerEmail: "Correo electrónico",
  registerUsername: "Nombre de usuario",
  registerPassword: "Contraseña",
  registerPasswordMin: "Debe tener al menos 14 caracteres.",
  registerVerifyPassword: "Verificar Contraseña",
  registerHasCode: "¿Tiene un código de registro?",
  registerCodeLabel: "Código de registro",
  registerCodePlaceholder: "Ingrese su código",
  registerCreating: "Creando...",
  registerCreateAccount: "Crear cuenta",
  registerBackToLogin: "Volver al inicio de sesión",
  registerErrPwdShort: "La contraseña debe tener al menos 14 caracteres.",
  registerErrPwdMismatch: "Las contraseñas no coinciden.",
  registerErrEnterCode: "Por favor ingrese su código de registro.",
  registerErrFailed: "Error en el registro",
  registerPwdMismatchInline: "Las contraseñas no coinciden.",
  // Privacy page
  privacyLabel: "Política de Privacidad",
  privacyTitle: "Privacidad y uso de cookies",
  privacySub:
    "Este proyecto mantiene la intención de política original del frontend anterior adaptándola al sistema visual actual.",
  privacyCookieText:
    "Las cookies esenciales admiten el estado de inicio de sesión y la función del sitio. En su primera visita se muestra un banner de consentimiento donde puede aceptar o rechazar las cookies de análisis opcionales. Su elección se almacena en el localStorage de su navegador con la clave cookie_consent y el banner no volverá a aparecer. Puede retirar o cambiar su elección en cualquier momento borrando el almacenamiento local de su navegador para este sitio.",
  privacySection1Title: "Qué datos recopilamos",
  privacySection1Text:
    "North Star puede recopilar los datos de contacto enviados por los usuarios del personal, las credenciales de inicio de sesión de la cuenta, los registros de donantes ingresados por los administradores y la información de uso del sitio a través de cookies de análisis opcionales.",
  privacySection2Title: "Cómo se utilizan los datos",
  privacySection2Text:
    "Usamos los datos para gestionar el acceso del personal, mantener los registros de donantes y contribuciones, entender qué partes del sitio son útiles y comunicarnos con los usuarios que solicitan actualizaciones o soporte.",
  privacySection3Title: "Cómo se almacenan los datos",
  privacySection3Text:
    "Los registros de cuentas y donantes se almacenan en bases de datos de aplicaciones protegidas con acceso limitado al personal autorizado. Las preferencias de análisis se almacenan localmente en su navegador.",
  privacySection4Title: "Sus derechos",
  privacySection4Text:
    "Los usuarios pueden solicitar acceso a los datos personales, corrección de información inexacta, eliminación cuando sea apropiado y retirada del consentimiento para cookies no esenciales.",
  // Not Found page
  notFoundHeadline: "¡Ups! Página no encontrada",
  notFoundReturn: "Volver al Inicio",
  // Donor Dashboard
  donorWelcome: "Bienvenido de nuevo",
  donorSub:
    "Rastree su historial de donaciones, vea el impacto de sus contribuciones y continúe haciendo la diferencia para los niños de Colombia.",
  donorTotalGiven: "Total Donado",
  donorDonations: "Donaciones",
  donorActiveMonths: "Meses Activos",
  donorLastGift: "Último Donativo",
  donorYourImpact: "Tu Impacto",
  donorImpactDesc:
    "Cada donación ayuda a financiar vivienda segura, alimentación, educación y orientación para los niños bajo el cuidado de North Star.",
  donorMostRecent: "Contribución Más Reciente",
  donorNoContributions: "Aún no hay contribuciones registradas.",
  donorWhatHelps: "En qué ayudan sus contribuciones",
  donorSupportInAction: "Apoyo en acción",
  donorSafeHousing: "Vivienda segura",
  donorSafeHousingDesc: "Un entorno familiar seguro",
  donorMeals: "Alimentación y nutrición",
  donorMealsDesc: "Comidas diarias para niños",
  donorEducation: "Educación",
  donorEducationDesc: "Útiles escolares y tutoría",
  donorCounseling: "Orientación",
  donorCounselingDesc: "Sesiones de apoyo terapéutico",
  donorMakeADonation: "Hacer una Donación",
  donorMakeADonationDesc:
    "Envíe una donación para apoyar la misión de North Star. No se procesa ningún pago real — este es un entorno de demostración.",
  donorTypeOfContribution: "Tipo de Contribución",
  donorMonetary: "Monetaria",
  donorVolunteerTime: "Tiempo Voluntario",
  donorSkillsServices: "Habilidades y Servicios",
  donorInKindGoods: "Bienes en Especie",
  donorSocialMedia: "Redes Sociales",
  donorAmount: "Monto",
  donorNumHours: "Número de Horas",
  donorNumItems: "Número de Artículos",
  donorNumPosts: "Número de Publicaciones",
  donorCurrency: "Moneda",
  donorUSD: "USD — Dólar estadounidense",
  donorCOP: "COP — Peso colombiano",
  donorDescribeContribution: "Describa su Contribución",
  donorNoteOptional: "Nota (opcional)",
  donorSkillsPlaceholder: "p. ej. Consulta legal, tutoría, examen médico…",
  donorNotePlaceholder: "En honor a…",
  donorProcessing: "Procesando…",
  donorDonateNow: "Donar Ahora",
  donorLogContribution: "Registrar Contribución",
  donorDonationHistory: "Historial de Donaciones",
  donorHistoryDesc: "Un registro completo de cada contribución vinculada a su cuenta.",
  donorLoading: "Cargando…",
  donorNoDonations:
    "Aún no hay donaciones. Cuando envíe una donación arriba, aparecerá aquí.",
  donorDateCol: "Fecha",
  donorTypeCol: "Tipo",
  donorContributionCol: "Contribución",
  donorNoteCol: "Nota",
  donorEditDonation: "Editar Donación",
  donorEditDesc: "Actualice los detalles de esta contribución o elimínela.",
  donorTypeEditLabel: "Tipo",
  donorDelete: "Eliminar",
  donorCancel: "Cancelar",
  donorSaveChanges: "Guardar Cambios",
  donorSavingChanges: "Guardando…",
  donorDeleteDonation: "Eliminar Donación",
  donorDeleteConfirm:
    "Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar esta donación?",
  donorDateLabel: "Fecha:",
  donorTypeLabelInline: "Tipo:",
  donorAmountLabel: "Monto:",
  donorNoteLabelInline: "Nota:",
  donorDeleting: "Eliminando…",
  donorToastSuccess: "Gracias — su contribución ha sido registrada.",
  donorToastUpdated: "Donación actualizada.",
  donorToastDeleted: "Donación eliminada.",
  donorToastErrValue: "Ingrese un valor válido mayor que cero.",
  donorToastErrSkills: "Por favor describa las habilidades o servicios que contribuyó.",
  donorToastErrSave: "No se pudo guardar la contribución.",
  donorToastErrUpdate: "No se pudo actualizar la donación.",
  donorToastErrDelete: "No se pudo eliminar la donación.",
  donorToastErrLoad: "No se pudieron cargar las donaciones.",
  donorToastErrSkillsEdit: "Por favor describa las habilidades o servicios contribuidos.",
  // Admin Dashboard
  adminTitle: "Panel de Administración",
  adminDesc: "Centro de control para el personal que administra North Star.",
  adminKeyMetrics: "Métricas Clave",
  adminRefresh: "Actualizar",
  adminRefreshing: "Actualizando…",
  adminChildrenInCare: "Niños Actualmente en Cuidado",
  adminTotalContributions: "Contribuciones Totales",
  adminReintegrationRate: "Tasa de Reinserción",
  adminActiveSupporters: "Donantes Activos",
  adminSafeHouseOccupancy: "Ocupación de Casas Seguras",
  adminLinkMlReports: "Informes ML",
  adminLinkMlReportsDesc:
    "Perspectivas y predicciones de aprendizaje automático en todas las áreas del programa.",
  adminLinkCaseload: "Inventario de Casos",
  adminLinkCaseloadDesc: "Ver y gestionar los casos de residentes en las casas seguras.",
  adminLinkProcessRecording: "Registro de Procesos",
  adminLinkProcessRecordingDesc: "Registrar y revisar los registros de procesos operativos.",
  adminLinkVisits: "Visitas y Conferencias",
  adminLinkVisitsDesc:
    "Registre visitas domiciliarias, historial de conferencias de casos, preocupaciones de seguridad y acciones de seguimiento.",
  adminLinkDonorMgmt: "Gestión de Donantes",
  adminLinkDonorMgmtDesc: "Ver y gestionar los registros de donantes e historial de contribuciones.",
  // Caseload page
  caseloadTitle: "Inventario de Casos",
  caseloadBackToDashboard: "Volver al Panel",
  caseloadSearch: "Buscar",
  caseloadSearchPlaceholder: "Buscar residentes…",
  caseloadClearSearch: "Borrar búsqueda",
  caseloadAddResident: "Agregar Residente",
  caseloadName: "Nombre",
  caseloadSafehouse: "Casa Segura",
  caseloadStatus: "Estado",
  caseloadRisk: "Riesgo",
  caseloadAge: "Edad",
  caseloadAdmitted: "Admitido",
  caseloadSubcategories: "Subcategorías",
  caseloadNoResults: "No se encontraron residentes.",
  caseloadLoading: "Cargando…",
  caseloadEdit: "Editar",
  caseloadDelete: "Eliminar",
  caseloadSave: "Guardar",
  caseloadCancel: "Cancelar",
  caseloadPrev: "Anterior",
  caseloadNext: "Siguiente",
  caseloadAddTitle: "Agregar Residente",
  caseloadEditTitle: "Editar Residente",
  caseloadDeleteTitle: "Eliminar Residente",
  caseloadDeleteConfirm: "¿Está seguro de que desea eliminar este residente?",
  caseloadFilters: "Filtros",
  // Process Recording page
  processTitle: "Registro de Procesos",
  processBackToDashboard: "Volver al Panel",
  processSearch: "Buscar",
  processSearchPlaceholder: "Buscar registros…",
  processAddRecord: "Agregar Registro",
  processDate: "Fecha",
  processType: "Tipo",
  processWorker: "Trabajador",
  processSafehouse: "Casa Segura",
  processResident: "Residente",
  processSummary: "Resumen",
  processActions: "Acciones",
  processNoResults: "No se encontraron registros.",
  processLoading: "Cargando…",
  processEdit: "Editar",
  processDelete: "Eliminar",
  processSave: "Guardar",
  processCancel: "Cancelar",
  processAddTitle: "Agregar Registro",
  processEditTitle: "Editar Registro",
  processDeleteTitle: "Eliminar Registro",
  processDeleteConfirm: "¿Está seguro de que desea eliminar este registro?",
  // Home Visitation page
  visitTitle: "Visitas y Conferencias",
  visitBackToDashboard: "Volver al Panel",
  visitSearch: "Buscar",
  visitSearchPlaceholder: "Buscar visitas…",
  visitAddVisit: "Agregar Visita",
  visitDate: "Fecha",
  visitType: "Tipo",
  visitWorker: "Trabajador",
  visitResident: "Residente",
  visitSummary: "Resumen",
  visitSafetyConcerns: "Preocupaciones de Seguridad",
  visitFollowUp: "Seguimiento",
  visitActions: "Acciones",
  visitNoResults: "No se encontraron visitas.",
  visitLoading: "Cargando…",
  visitEdit: "Editar",
  visitDelete: "Eliminar",
  visitSave: "Guardar",
  visitCancel: "Cancelar",
  visitAddTitle: "Agregar Visita",
  visitEditTitle: "Editar Visita",
  visitDeleteTitle: "Eliminar Visita",
  visitDeleteConfirm: "¿Está seguro de que desea eliminar esta visita?",
  // Reports page
  reportsTitle: "Informes ML",
  reportsBackToDashboard: "Volver al Panel",
  reportsLoading: "Cargando informes…",
  reportsNoData: "No hay datos de informes disponibles.",
  // Donors (admin) page
  donorsTitle: "Gestión de Donantes",
  donorsBackToDashboard: "Volver al Panel",
  donorsSearch: "Buscar",
  donorsSearchPlaceholder: "Buscar donantes…",
  donorsAddDonor: "Agregar Donante",
  donorsName: "Nombre",
  donorsEmail: "Correo electrónico",
  donorsPhone: "Teléfono",
  donorsType: "Tipo",
  donorsStatus: "Estado",
  donorsTotalGiven: "Total Donado",
  donorsContributions: "Contribuciones",
  donorsNoResults: "No se encontraron donantes.",
  donorsLoading: "Cargando…",
  donorsEdit: "Editar",
  donorsDelete: "Eliminar",
  donorsSave: "Guardar",
  donorsCancel: "Cancelar",
  donorsAddTitle: "Agregar Donante",
  donorsEditTitle: "Editar Donante",
  donorsDeleteTitle: "Eliminar Donante",
  donorsDeleteConfirm: "¿Está seguro de que desea eliminar este donante?",
  // Caseload extras
  caseloadSubtitle: "Perfiles de residentes según los estándares de la agencia de bienestar social de Filipinas.",
  caseloadNewRecord: "Nuevo Registro",
  caseloadNewResidentRecord: "Nuevo Registro de Residente",
  caseloadNoRecordsFound: "No se encontraron registros",
  caseloadCaseNo: "No. de Caso",
  caseloadCategory: "Categoría",
  caseloadSocialWorker: "Trabajador Social",
  caseloadReintegration: "Reinserción",
  caseloadAllStatuses: "Todos los estados",
  caseloadAllSafehouses: "Todas las casas seguras",
  caseloadAllCategories: "Todas las categorías",
  caseloadAllReintegration: "Toda reinserción",
  caseloadAllSocialWorkers: "Todos los trabajadores sociales",
  caseloadClearFilters: "Borrar filtros",
  // ProcessRecording extras
  processSubtitle: "Notas de sesiones de orientación que documentan el proceso de sanación de cada residente, registradas cronológicamente.",
  processNewSession: "Nueva Sesión",
  processSearchDetailed: "Buscar residente, trabajador, narrativa…",
  processNoRecordingsFound: "No se encontraron grabaciones",
  // HomeVisitation extras
  visitFullTitle: "Visitas Domiciliarias y Conferencias de Casos",
  visitSubtitle: "Registros de visitas domiciliarias y de campo, historial de conferencias de casos y próximas conferencias para cada residente.",
  visitLogVisit: "Registrar Visita",
  visitNewConference: "Nueva Conferencia",
  visitHomeVisitsTab: "Visitas Domiciliarias",
  visitConferencesTab: "Conferencias de Casos",
  // Reports extras
  reportsFullTitle: "Informes y Análisis",
  reportsSubtitleText: "Perspectivas agregadas, predicciones de ML y exploración interactiva de registros.",
  reportsTabAnalytics: "Panel de Análisis",
  reportsTabLookup: "Búsqueda de Registros",
  reportsTabInsights: "Perspectivas ML",
  // Donors admin extras
  donorsContributionsTitle: "Donantes y Contribuciones",
  donorsManageDesc: "Gestione los registros de donantes, el historial de donaciones y los detalles de asignación.",
  donorsViewDesc: "Una vista centrada en la administración de adónde va el apoyo y cómo se sostiene el trabajo.",
  donorsAddSupporter: "Agregar Donante",
  donorsOpenDashboard: "Abrir panel de donante",
  donorsStaffLogin: "Inicio de sesión del personal",
  donorsLoadingText: "Cargando donantes...",
  // Donors admin extras (table / forms)
  donorsSupporter: "Donante",
  donorsAllTypes: "Todos los tipos de donantes",
  donorsAllStatuses: "Todos los estados",
  donorsActiveStatus: "Activo",
  donorsInactiveStatus: "Inactivo",
  donorsClearFilters: "Borrar filtros",
  donorsNoSupporters: "No se encontraron donantes que coincidan con sus criterios.",
  donorsDonationAllocations: "Asignaciones de Donaciones",
  donorsRestrictedText: "La gestión detallada de donantes está restringida a los administradores. Esta versión pública mantiene el mismo lenguaje de diseño mientras expone solo resúmenes de administración de alto nivel.",
  donorsNewSupporter: "Nuevo Registro de Donante",
  donorsSupporterDetails: "Detalles del Donante",
  donorsFirstName: "Nombre",
  donorsLastName: "Apellido",
  donorsSupporterType: "Tipo de Donante",
  donorsDeleteSupporter: "Eliminar Donante",
  donorsSaveSupporter: "Guardar Donante",
  donorsDeletingText: "Eliminando…",
  donorsContribHistory: "Historial de Contribuciones",
  donorsLogContribution: "Registrar Contribución",
  donorsDate: "Fecha",
  donorsAmountValue: "Monto/Valor ($)",
  donorsProgramArea: "Área del Programa",
  donorsNotesDesc: "Notas / Descripción",
  donorsNoContributions: "No se registraron contribuciones.",
  donorsNoEmail: "Sin correo registrado",
  donorsSearchNameEmail: "Buscar nombre o correo...",
  // Reports analytics tab
  reportsActiveResidents: "Residentes Activos",
  reportsKpiTotal: "total",
  reportsKpiSupporters: "donantes",
  reportsKpiInProgress: "en progreso",
  reportsVolunteerHours: "Horas de Voluntariado",
  reportsServicesProvided: "Servicios Prestados",
  reportsCaring: "Cuidado",
  reportsHealing: "Sanación",
  reportsTeaching: "Enseñanza",
  reportsBeneficiaryCounts: "Conteo de Beneficiarios",
  reportsTotalServed: "Total Atendidos",
  reportsActiveLabel: "Activos",
  reportsClosed: "Cerrados",
  reportsReintegrated: "Reintegrados",
  reportsEducationOutcomes: "Resultados Educativos",
  reportsAvgAttendance: "Asistencia Promedio",
  reportsAvgProgress: "Progreso Promedio",
  reportsHealthWellbeing: "Salud y Bienestar",
  reportsGeneralHealth: "Salud General",
  reportsNutrition: "Nutrición",
  reportsSleepQuality: "Calidad del Sueño",
  reportsExcellent: "Excelente",
  reportsGood: "Bueno",
  reportsFair: "Regular",
  reportsNeedsImprovement: "Necesita Mejora",
  reportsCheckupCompletion: "Cumplimiento de Controles",
  reportsMedical: "Médico",
  reportsDental: "Dental",
  reportsPsychological: "Psicológico",
  reportsDonationTrends: "Tendencias de Donaciones",
  reportsNoDonationData: "No hay datos de donaciones disponibles.",
  reportsContributionsByType: "Contribuciones por Tipo",
  reportsSafehousePerf: "Rendimiento de Casas Seguras",
  reportsPercentFull: "% llena",
  reportsActiveSmall: "activos",
  reportsReintegSmall: "reinteg.",
  reportsIncidents: "incidentes",
  reportsReintegrationStatus: "Estado de Reinserción",
  reportsAdmissionsClosures: "Admisiones y Cierres",
  reportsAdmissionsLegend: "Admisiones",
  reportsClosuresLegend: "Cierres",
  reportsLoadingAnalytics: "Cargando análisis…",
  reportsCouldNotLoad: "No se pudieron cargar los datos de análisis.",
  // Reports insights / lookup tab
  reportsMlLastUpdated: "Última actualización ML:",
  reportsRefreshPredictions: "Actualizar predicciones",
  reportsFullRetrain: "Reentrenamiento completo",
  reportsRunning: "Ejecutando…",
  reportsAnalysisLabel: "Análisis",
  reportsPredictionLabel: "Predicción",
  reportsAnalysisSummary: "Resumen de Análisis",
  reportsActionableRecs: "Recomendaciones Accionables",
  reportsPredictionRecords: "Registros de Predicción",
  reportsViewAll: "Ver todo",
  reportsClose: "Cerrar",
  reportsAllRecords: "Todos los Registros",
  reportsRecordCol: "Registro",
  reportsTypeCol: "Tipo",
  reportsPrevious: "Anterior",
  reportsNextPage: "Siguiente",
  reportsTotal: "total",
  reportsPage: "página",
  reportsOf: "de",
  reportsNoPredictions: "Aún no hay predicciones — ejecute una actualización para generar puntuaciones.",
  reportsLoadingDots: "Cargando…",
  reportsLoadingRecords: "Cargando registros…",
  reportsNoRecordsFound: "No se encontraron registros.",
  reportsSelectRecord: "Seleccione un registro para ver detalles",
  reportsRecordType: "Tipo de Registro",
  reportsRecordId: "ID de Registro",
  reportsScoreGauge: "Indicador de Puntuación",
  reportsLastScored: "Última puntuación:",
  reportsSearchByName: "Buscar por nombre o ID…",
  reportsSelectDomainDesc: "Seleccione un dominio y busque un registro específico para ver su predicción detallada. Usa datos calificados existentes de la ejecución del modelo más reciente.",
  // ML Domain translations
  domainDonorAcqLabel: "Adquisición de Donantes",
  domainDonorAcqScoreLabel: "Probabilidad de adquisición",
  domainDonorAcqTierLabel: "Nivel de riesgo",
  domainDonorAcqDesc: "Identifica qué nuevos donantes tienen más probabilidades de convertirse en donantes recurrentes en 12 meses.",
  domainDonorAcqRec1: "Priorice el contacto con donantes organizacionales y contactos referidos por socios — estos perfiles están más fuertemente asociados con convertirse en donantes a largo plazo de alto valor.",
  domainDonorAcqRec2: "Realice un seguimiento del compromiso en los primeros 90 días: los donantes que interactúan varias veces al principio tienen significativamente más probabilidades de convertirse en donantes recurrentes.",
  domainDonorChurnLabel: "Abandono de Donantes",
  domainDonorChurnScoreLabel: "Probabilidad de abandono",
  domainDonorChurnTierLabel: "Nivel de riesgo",
  domainDonorChurnDesc: "Predice qué donantes activos corren el riesgo de dejar de donar en los próximos 90 días.",
  domainDonorChurnRec1: "Marque a los donantes que no han donado en más de 60 días para un contacto personal — la recencia del último regalo es el predictor más fuerte del riesgo de abandono.",
  domainDonorChurnRec2: "Preste especial atención a los donantes que llegaron a través de referencias de socios, ya que su canal de participación inicial influye en la retención a largo plazo.",
  domainIncidentLabel: "Riesgo de Incidentes",
  domainIncidentScoreLabel: "Probabilidad de gravedad",
  domainIncidentTierLabel: "Nivel de atención",
  domainIncidentDesc: "Identifica a los residentes con mayor riesgo de un incidente de alta gravedad en los próximos 30 días.",
  domainIncidentRec1: "Revise todos los planes de intervención mensualmente y priorice el seguimiento inmediato de los planes de categoría de seguridad estancados.",
  domainIncidentRec2: "Asegúrese de que no haya más de 14 días entre sesiones de orientación para residentes con preocupaciones marcadas.",
  domainReintLabel: "Preparación para la Reinserción",
  domainReintScoreLabel: "Puntuación de preparación",
  domainReintTierLabel: "Vía",
  domainReintDesc: "Evalúa qué residentes están listos para la reinserción y predice la vía más probable.",
  domainReintRec1: "Monitoree de cerca las tendencias de salud — una trayectoria de salud compuesta en mejora es el indicador más fuerte de que un residente está listo para la reinserción.",
  domainReintRec2: "Mantenga la asistencia educativa por encima del 75% antes de programar evaluaciones de reinserción, ya que las tendencias de asistencia son un predictor clave de la preparación.",
  domainSocialMediaLabel: "Impacto en Redes Sociales",
  domainSocialMediaScoreLabel: "Probabilidad de conversión",
  domainSocialMediaTierLabel: "Nivel de valor",
  domainSocialMediaDesc: "Predice qué publicaciones en redes sociales tienen más probabilidades de generar donaciones.",
  domainSocialMediaRec1: "Destaque las historias de residentes en sus publicaciones — este tipo de contenido impulsa tanto la conversión de donaciones como el valor de las donaciones más que cualquier otro factor.",
  domainSocialMediaRec2: "Programe promociones de eventos e historias de impacto durante las horas de la noche en Instagram para las tasas de conversión más altas.",
  domainVolunteerLabel: "Compromiso de Voluntarios",
  domainVolunteerScoreLabel: "Potencial de crecimiento",
  domainVolunteerTierLabel: "Estado",
  domainVolunteerDesc: "Identifica a los voluntarios con probabilidad de aumentar su compromiso frente a los que corren el riesgo de abandonar.",
  domainVolunteerRec1: "Reactive a los voluntarios inactivos (50% de la base) con campañas de contacto personal y eliminación de barreras — incluso pequeños logros pueden reactivarlos.",
  domainVolunteerRec2: "Retenga a los voluntarios de mayor rendimiento con roles de liderazgo exclusivos y eventos de reconocimiento — representan solo el 12,5% pero generan el mayor valor de compromiso.",
};
