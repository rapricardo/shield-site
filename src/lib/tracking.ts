export const TRACKING_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'gad_campaignid',
  'gad_source',
  'fbclid',
  'fbc',
  'fbp',
  'ttclid',
  'msclkid',
  'li_fat_id',
  'twclid',
  'sck',
  'landing_page',
  'referrer',
  'user_agent',
  'first_visit',
  'session_id',
  'session_attributes_encoded',
  'originPage',
  'ref',
] as const;

export type TrackingField = (typeof TRACKING_FIELDS)[number];
export type TrackingData = Partial<Record<TrackingField, string>> & Record<string, string | undefined>;

export interface LeadSubmitData {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
}

declare global {
  interface Window {
    __wlTracking?: TrackingData;
    __wlPopulateHiddenFields?: (root?: ParentNode) => void;
    __wlPushLeadSubmit?: (lead?: LeadSubmitData, extra?: Record<string, unknown>) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export function getTrackingData(): TrackingData {
  if (typeof window === 'undefined') return {};
  return window.__wlTracking || {};
}

export function pushLeadSubmitEvent(lead: LeadSubmitData = {}, extra: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  if (window.__wlPushLeadSubmit) {
    window.__wlPushLeadSubmit(lead, extra);
    return;
  }

  const tracking = getTrackingData();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_submit_lead',
    lead_name: lead.name || null,
    lead_email: lead.email || null,
    lead_whatsapp: lead.whatsapp || null,
    ...Object.fromEntries(TRACKING_FIELDS.map((field) => [field, tracking[field] || null])),
    ...extra,
  });
}
