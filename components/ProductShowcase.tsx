"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile, Product } from "@/lib/types";
import { useEffect, useState } from "react";

interface ProductShowcaseProps {
  user: Profile | null;
  onLoginClick?: () => void;
}

export default function ProductShowcase({
  user,
  onLoginClick,
}: ProductShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (data) {
        setProducts(data);
      }
    }
    fetchProducts();
  }, [supabase]);

  async function trackAction(
    productId: string,
    actionType: "preview" | "download"
  ) {
    if (!user) return;

    await supabase.from("document_views").insert([
      {
        user_id: user.id,
        product_id: productId,
        action_type: actionType,
      },
    ]);
  }

  function handlePreview(product: Product) {
    if (user && product.external_url) {
      trackAction(product.id, "preview");
      window.open(product.external_url, "_blank");
    }
  }

  function handleDownload(product: Product) {
    if (user) {
      trackAction(product.id, "download");
      // Simulate download - in production, this would download actual whitepapers
      alert(`Downloading ${product.name} whitepaper...`);
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-kaspersky-100 mb-6">
          <svg
            className="w-10 h-10 text-kaspersky-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-600 mb-6">
          Please log in to view our product showcase
        </p>
        <button
          onClick={onLoginClick}
          className="bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white px-8 py-3 rounded-xl font-bold hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Login / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-kaspersky-600 via-kaspersky-500 to-kaspersky-700 p-8 rounded-2xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="product-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#product-pattern)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Kaspersky B2B Catalogue
            </h2>
          </div>
          <p className="text-white/90 text-lg">
            Explore our comprehensive enterprise security solutions
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl shadow-soft border-2 border-gray-100 p-6 hover:shadow-glow hover:border-kaspersky-200 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-kaspersky-500 to-kaspersky-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-kaspersky-600 transition-colors">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {product.external_url && (
                <button
                  onClick={() => handlePreview(product)}
                  className="flex-1 bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white px-5 py-3 rounded-xl font-semibold hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </span>
                </button>
              )}
              <button
                onClick={() => handleDownload(product)}
                className="flex-1 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all border-2 border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 mb-6">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Products Available
          </h3>
          <p className="text-gray-500">
            Check back soon for new security solutions
          </p>
        </div>
      )}
    </div>
  );
}
