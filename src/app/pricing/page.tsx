"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8 text-center">
            <h3 className="text-xl font-bold text-red-700">
              Unable to Load Pricing
            </h3>
            <p className="mt-2 text-red-600">
              {error || "No products configured"}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`rounded-lg border-2 bg-white p-8 shadow-lg ${
                index === 1 ? "border-blue-600" : "border-gray-200"
              }`}
            >
              {index === 1 && (
                <span className="mb-4 inline-block rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold">{product.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {product.displayPrice}
                </span>
              </div>
              {product.description && (
                <p className="mt-4 text-sm text-gray-600">
                  {product.description}
                </p>
              )}
              <button
                onClick={() => handleSubscribe(product.id)}
                disabled={checkoutLoading === product.id}
                className={`mt-8 w-full rounded-lg px-6 py-3 font-semibold ${
                  index === 1
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                } disabled:opacity-50`}
              >
                {checkoutLoading === product.id
                  ? "Loading..."
                  : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
