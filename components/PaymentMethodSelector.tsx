"use client";

import { useState } from "react";
import { type dictionaries } from "@/lib/i18n/dictionaries";

interface PaymentMethodSelectorProps {
  dict: typeof dictionaries["en"];
  onSelect: (method: string) => void;
}

export default function PaymentMethodSelector({ dict, onSelect }: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState("bkash");

  const methods = [
    { id: "bkash", name: dict.payment.bkash, icon: "💳", color: "#e2136e" },
    { id: "nagad", name: dict.payment.nagad, icon: "💸", color: "#f7941d" },
    { id: "card", name: dict.payment.card, icon: "🏦", color: "#6c63ff" }
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-sm font-bold text-[#4a5568] uppercase tracking-wider mb-4">
        {dict.payment.selectMethod}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => handleSelect(method.id)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
              selected === method.id
                ? "border-[#6c63ff] bg-[#6c63ff]/5 shadow-[inset_4px_4px_8px_#c4c9ce,inset_-4px_-4px_8px_#ffffff]"
                : "border-transparent bg-transparent hover:bg-[#6c63ff]/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                style={{ background: `${method.color}20`, color: method.color }}
              >
                {method.id === "bkash" ? "b" : method.id === "nagad" ? "n" : "c"}
              </div>
              <span className={`font-bold ${selected === method.id ? "text-[#1a202c]" : "text-[#718096]"}`}>
                {method.name}
              </span>
            </div>
            {selected === method.id && (
              <div className="w-5 h-5 rounded-full bg-[#6c63ff] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>
      <input type="hidden" name="paymentMethod" value={selected} />
    </div>
  );
}
