import { Suspense } from "react";
import PaymentFailedContent from "./PaymentFailedContent";

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
