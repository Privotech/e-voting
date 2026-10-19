import type { Metadata } from "next";
import "./globals.css";
import "../src/Auth/AdminLogin.css";
import "../src/Auth/Login.css";
import "../src/Auth/Signup.css";
import "../src/Components/CandidateCard.css";
import "../src/Components/CountdownTimer.css";
import "../src/Components/Footer.css";
import "../src/Components/Navbar.css";
import "../src/Components/Spinner.css";
import "../src/Components/TemplateSelector.css";
import "../src/Components/VoterDashboardLayout.css";
import "../src/Views/Admin/Admin.css";
import "../src/Views/Admin/components/AdminOverview.css";
import "../src/Views/Admin/components/AdminTable.css";
import "../src/Views/Ballot.css";
import "../src/Views/Confirmation.css";
import "../src/Views/Confirmation/ConfirmationReceipt.css";
import "../src/Views/ElectionGuide.css";
import "../src/Views/ElectionGuide/GuideFaq.css";
import "../src/Views/ElectionGuide/GuideProcedure.css";
import "../src/Views/ElectionGuide/GuideRules.css";
import "../src/Views/ElectionGuide/GuideSandbox.css";
import "../src/Views/LandingPage.css";
import "../src/Views/LandingPage/LandingHero.css";
import "../src/Views/Results.css";
import "../src/Views/Review.css";
import { ThemeProvider } from "../src/Context/ThemeContext";

export const metadata: Metadata = {
  title: "INEC E-Voting System",
  description: "Official Independent National Electoral Commission Electronic Voting Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
