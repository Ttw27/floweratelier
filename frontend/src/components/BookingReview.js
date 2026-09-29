import { Button } from "@/components/ui/button";
import { fmtWorkshopDate, fmtTimeRange, sessionLocationLabel } from "../lib/workshopPricing";

export const DEFAULT_CANCELLATION_POLICY = "Deposits are non-refundable. Balance is collected on the day.";

const PHOTO_LABELS = {
  yes: "Yes — photos of the group and the creations",
  creations_only: "Creations only — no faces please",
  no: "No photos please",
};

const gbp = (n) => `£${(Number(n) || 0).toFixed(2)}`;

function Section({ title, rows }) {
  const shown = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
  if (!shown.length) return null;
  return (
    <div className="border-t border-[#E5E5E5] pt-4">
      <p className="accent-label mb-2"><span className="thin-rule" />{title}</p>
      <dl className="space-y-1.5">
        {shown.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 font-body text-sm">
            <dt className="text-[#7A7A7A]">{label}</dt>
            <dd className="text-[#1A1A1A] whitespace-pre-line break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * "Check your booking" screen shown before anything is submitted.
 * form: everything the customer typed; amounts: from calcWorkshopAmounts.
 */
export default function BookingReview({
  workshop, session, form, forOrganisation = false, amounts, paymentMethod,
  agreed, onAgreeChange, onEdit, onConfirm, submitting, testIdPrefix = "booking-review",
}) {
  const atVenue = !!session?.at_customer_venue;
  const venueLine = [form.venue_name, form.venue_address, form.venue_postcode].map((x) => String(x || "").trim()).filter(Boolean).join(", ");
  const when = [fmtWorkshopDate(session?.date), fmtTimeRange(session?.start_time, session?.end_time)].filter(Boolean).join(", ");
  const policy = String(workshop?.cancellation_policy || "").trim() || DEFAULT_CANCELLATION_POLICY;
  const { effectiveChoice, amountDueNow, balanceOnDay, subtotal, discountAmount, discountPct } = amounts;
  const isBank = paymentMethod === "bank_transfer";
  const guests = parseInt(form.guests, 10) || 1;

  return (
    <div className="space-y-4" data-testid={testIdPrefix}>
      <div>
        <p className="accent-label mb-1"><span className="thin-rule" />Check your booking</p>
        <p className="font-body text-sm text-[#5A5A5A]">Nothing has been booked yet. Please check everything below, then confirm.</p>
      </div>

      <Section title="Workshop" rows={[
        ["Workshop", workshop?.name],
        ["Date & time", when],
        ["Location", atVenue ? (venueLine || "At your venue") : sessionLocationLabel(session, workshop)],
        ["Guests", String(guests)],
      ]} />

      <Section title="Your details" rows={[
        ["Name", form.name?.trim()],
        ["Email", form.email?.trim()],
        ["Phone", form.phone?.trim()],
      ]} />

      {forOrganisation && (
        <Section title="Organisation & invoice" rows={[
          ["Organisation", form.organisation_name],
          ["PO / reference", form.po_number],
          ["Billing address", form.billing_address],
        ]} />
      )}

      {atVenue && (
        <Section title="Venue & logistics" rows={[
          ["Venue", form.venue_name],
          ["Address", form.venue_address],
          ["Postcode", form.venue_postcode],
          ["Earliest set-up time", form.arrival_time],
          ["Contact on the day", form.onsite_contact_name],
          ["Their mobile", form.onsite_contact_phone],
          ["Parking & access", form.access_notes],
          ["Room & tables", form.setup_notes],
        ]} />
      )}

      <Section title="Your group" rows={[
        ["Occasion", form.occasion],
        ["Colours / theme", form.theme_preferences],
        ["Accessibility", form.accessibility_needs],
        ["About the group", form.group_notes],
        ["Dietary requirements", form.dietary_requirements],
        ["Notes", form.notes],
        ["Photo permission", PHOTO_LABELS[form.photo_consent] || form.photo_consent],
        ["Heard about us", form.heard_about],
      ]} />

      <Section title="Payment" rows={[
        ["Paying", effectiveChoice === "full" ? "In full" : "Deposit"],
        ["Payment method", isBank ? "Bank transfer" : "Card"],
      ]} />

      <div className="bg-white border border-[#E5E5E5] p-4 text-sm" data-testid={`${testIdPrefix}-amounts`}>
        <div className="flex justify-between py-1 text-[13px] text-[#5A5A5A]"><span>{guests} × guest</span><span>{gbp(subtotal)}</span></div>
        {discountAmount > 0 && (
          <div className="flex justify-between py-1 text-[13px] text-[#5A5A5A]"><span>Full-payment discount ({discountPct}%)</span><span>–{gbp(discountAmount)}</span></div>
        )}
        <div className="border-t border-[#E5E5E5] mt-2 pt-2">
          <div className="flex justify-between py-1 font-heading text-base text-[#1A1A1A]"><span>{isBank ? "To pay now (bank transfer)" : "To pay now (card)"}</span><span>{gbp(amountDueNow)}</span></div>
          {balanceOnDay > 0 && (
            <div className="flex justify-between py-1 text-[13px] text-[#5A5A5A]"><span>Balance on the day (cash or card)</span><span>{gbp(balanceOnDay)}</span></div>
          )}
        </div>
      </div>

      <p className="text-[12px] text-[#5A5A5A] leading-relaxed" data-testid={`${testIdPrefix}-policy`}>
        <strong className="text-[#1A1A1A]">Cancellation policy:</strong> {policy}
      </p>

      <label className="flex items-start gap-3 cursor-pointer bg-white border border-[#E5E5E5] p-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={!!agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
          data-testid={`${testIdPrefix}-agree`}
        />
        <span className="font-body text-sm text-[#1A1A1A]">I&rsquo;ve checked my details and agree to the cancellation policy</span>
      </label>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-3 border-t border-[#E5E5E5]">
        <Button type="button" variant="outline" className="rounded-none btn-booking" onClick={onEdit} disabled={submitting} data-testid={`${testIdPrefix}-edit`}>
          Edit details
        </Button>
        <Button type="button" onClick={onConfirm} disabled={!agreed || submitting} className="btn-dark rounded-none btn-booking" data-testid={`${testIdPrefix}-confirm`}>
          {submitting ? (isBank ? "Please wait…" : "Redirecting to secure payment…") : (
            <>
              <span className="sm:hidden">Confirm booking · {gbp(amountDueNow)}</span>
              <span className="hidden sm:inline">{isBank ? `Confirm booking — ${gbp(amountDueNow)} by bank transfer` : `Confirm & pay ${gbp(amountDueNow)}`}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
