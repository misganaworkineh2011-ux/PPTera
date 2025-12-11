"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

type Product = {
  id: string;
  name: string;
  description?: string;
  displayPrice: string;
  priceAmount: number | null;
  priceCurrency: string | null;
};

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/polar/products");
        if (!res.ok) {
          throw new Error("Failed to load products");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pricing");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSubscribe = async (productId: string) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setCheckoutLoading(productId);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout");
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      alert("Failed to create checkout. Please try again.");
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-900 md:text-6xl">
            Choose the plan that's
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              right for you
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Start for free, upgrade when you need more power
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-8 shadow-lg transition hover:shadow-2xl ${
                index === 1
                  ? "border-blue-600 ring-4 ring-blue-100"
                  : "border-slate-200"
              }`}
            >
              {index === 1 && (
                <div className="absolute right-6 top-6">
                  <span className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  {product.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">
                    ${(product.priceAmount || 0) / 100}
                  </span>
                  <span className="text-slate-600">/ month</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Billed monthly</p>
              </div>

              {product.description && (
                <p className="mb-6 text-sm text-slate-600">
                  {product.description}
                </p>
              )}

              <button
                onClick={() => handleSubscribe(product.id)}
                disabled={checkoutLoading === product.id}
                className={`w-full rounded-full px-6 py-3.5 font-semibold transition ${
                  index === 1
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl"
                    : "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                } disabled:opacity-50`}
              >
                {checkoutLoading === product.id
                  ? "Loading..."
                  : `Upgrade to ${product.name}`}
              </button>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-slate-700">
                    Unlimited AI creations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-slate-700">
                    Export to PPTX format
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-slate-700">
                    Premium AI models
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
