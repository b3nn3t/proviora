"use client";

import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import CatalogGrid from "@/components/sections/CatalogGrid";
import PageTransition from "@/components/animations/PageTransition";
import { useState } from "react";

export default function CatalogPage() {
  const [activeModal, setActiveModal] = useState<"about" | "contacts" | "auth" | null>(null);

  return (
    <PageTransition>
      <Header activeModal={activeModal} setActiveModal={setActiveModal} />
      <main className="pt-20 min-h-screen">
        <CatalogGrid />
      </main>
      <Footer />
    </PageTransition>
  );
}
