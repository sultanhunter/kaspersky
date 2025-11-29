"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile, Product } from "@/lib/types";
import { useEffect, useState } from "react";

interface ProductShowcaseProps {
  user: Profile | null;
}

export default function ProductShowcase({ user }: ProductShowcaseProps) {
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
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view product showcase</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Kaspersky B2B Catalogue
        </h2>
        <p className="text-gray-600">
          Explore our enterprise security solutions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-gray-600 mb-4">{product.description}</p>
            )}
            <div className="flex space-x-3">
              {product.external_url && (
                <button
                  onClick={() => handlePreview(product)}
                  className="flex-1 bg-kaspersky-green text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Details
                </button>
              )}
              <button
                onClick={() => handleDownload(product)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Download Brochure
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No products available at the moment</p>
        </div>
      )}
    </div>
  );
}
