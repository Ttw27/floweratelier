import { Copy } from "lucide-react";
import { toast } from "sonner";

// Normalise bank details from the API ({account_name, ...}) or from site settings ({bank_account_name, ...})
export function pickBankDetails(...sources) {
  for (const s of sources) {
    if (!s) continue;
    const d = {
      account_name: s.account_name ?? s.bank_account_name ?? "",
      bank_name: s.bank_name ?? "",
      sort_code: s.sort_code ?? s.bank_sort_code ?? "",
      account_number: s.account_number ?? s.bank_account_number ?? "",
    };
    if (d.sort_code && d.account_number) return d;
  }
  return null;
}

const copy = (text, label) => {
  try {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    /* clipboard unavailable — the value is still visible */
  }
};

function Line({ label, value, copyable }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 font-body text-sm">
      <span className="text-[#7A7A7A]">{label}</span>
      <span className="flex items-center gap-2 text-[#1A1A1A] text-right">
        <span className="font-medium tracking-wide">{value}</span>
        {copyable && (
          <button type="button" onClick={() => copy(value, label)} className="text-[#7A7A7A] hover:text-[#1A1A1A]" aria-label={`Copy ${label}`}>
            <Copy size={14} />
          </button>
        )}
      </span>
    </div>
  );
}

/** The shop's bank details, plus the payment reference and amount when known. */
export default function BankDetails({ details, reference, amount, compact = false }) {
  if (!details) return null;
  return (
    <div className={`bg-white border border-[#E5E5E5] ${compact ? "p-4" : "p-5"} space-y-2`} data-testid="bank-details">
      <Line label="Account name" value={details.account_name} />
      <Line label="Bank" value={details.bank_name} />
      <Line label="Sort code" value={details.sort_code} copyable />
      <Line label="Account number" value={details.account_number} copyable />
      {reference && (
        <div className="border-t border-[#E5E5E5] mt-3 pt-3">
          <Line label="Reference (please quote)" value={reference} copyable />
        </div>
      )}
      {typeof amount === "number" && amount > 0 && (
        <Line label="Amount to transfer" value={`£${amount.toFixed(2)}`} />
      )}
    </div>
  );
}
