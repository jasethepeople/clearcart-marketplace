import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { useState } from "react";

export function OrderReviewForm({ orderItemId, productName }: { orderItemId: number; productName: string }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);
  const mutation = trpc.marketplace.buyer.submitReview.useMutation({ onSuccess: () => { setBody(""); setOpen(false); } });
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 text-xs font-semibold uppercase tracking-[.14em] text-[#243d33] underline decoration-stone-300 underline-offset-4">Leave verified review</button>;
  return <form onSubmit={(event) => { event.preventDefault(); mutation.mutate({ orderItemId, rating, body: body || undefined }); }} className="mt-5 rounded-xl border border-[#d8af83] bg-[#fffaef] p-4"><p className="text-sm font-semibold">Review {productName}</p><div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} star rating`} onClick={() => setRating(value)} className="text-[#a25c3d]"><Star className={`h-5 w-5 ${value <= rating ? "fill-current" : ""}`} /></button>)}</div><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} className="mt-3 min-h-20 w-full rounded-lg border border-stone-200 bg-white p-3 text-sm outline-none focus:border-[#315545]" placeholder="Share a factual experience with this completed order (optional)." />{mutation.error && <p className="mt-2 text-xs text-red-600">{mutation.error.message}</p>}<div className="mt-3 flex gap-2"><button disabled={mutation.isPending} className="rounded-lg bg-[#243d33] px-3 py-2 text-xs font-semibold text-white">{mutation.isPending ? "Submitting…" : "Submit review"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600">Cancel</button></div></form>;
}
