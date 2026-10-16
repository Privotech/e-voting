"use client";

import { Link, Outlet } from "../Utils/nextNavigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface VoterLayoutProps {
  children?: React.ReactNode;
}

export default function VoterLayout({ children }: VoterLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="app-main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
