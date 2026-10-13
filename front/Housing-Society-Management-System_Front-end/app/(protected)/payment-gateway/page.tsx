"use client";

import { PaymentList } from "@/components/payment-gateway/PaymentList";

export default function PaymentGatewayPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <PaymentList />
    </div>
  );
}
