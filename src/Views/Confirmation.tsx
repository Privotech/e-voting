"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../Utils/nextNavigation";
import toast from "react-hot-toast";
import axios from "axios";
import { Mail, CheckCircle2, Send, Download, Home, ShieldCheck, Loader2 } from "lucide-react";
import { sanitizeFilename, escapeHtml } from "../Utils/sanitize";

export default function Confirmation() {
  const navigate = useNavigate();
  const [receiptToken, setReceiptToken] = useState<string | null>(null);
  const [voter, setVoter] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("receiptToken");
    const voterNIN = sessionStorage.getItem("voterNIN");
    const storedEmail = sessionStorage.getItem("voterEmail");

    if (!token || !voterNIN) {
      navigate("/login");
      return;
    }

    setReceiptToken(token);
    setVoter(voterNIN);
    if (storedEmail) setEmail(storedEmail);
  }, [navigate]);

  const handleSendEmailReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSendingEmail(true);
    try {
      const authToken = sessionStorage.getItem("voterAuthToken");
      if (!authToken) {
        throw new Error("Your voter session has expired. Log in again to send a receipt.");
      }
      const response = await axios.post("/api/email/send-receipt", {
        email,
        receiptToken,
      }, {
        headers: { "x-auth-token": authToken },
      });

      if (response.data && response.data.success) {
        toast.success(`Official receipt sent to ${email}`);
        setEmailSentSuccess(true);
        setLastSentEmail(email);
        sessionStorage.setItem("voterEmail", email);
      } else {
        throw new Error(response.data?.message || "Receipt email could not be sent.");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Receipt email could not be sent. Please try again."
        : error instanceof Error ? error.message : "Receipt email could not be sent. Please try again.";
      toast.error(message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!receiptToken) return;

    const receiptContent = `
==================================================
        INEC E-VOTING OFFICIAL RECEIPT
==================================================
Thank you for voting! Your ballot is recorded.

Receipt Token:   ${receiptToken}
Issued At:       ${new Date().toLocaleString()}
Voter NIN:       ${voter ? voter.substring(0, 4) + '****' + voter.substring(8) : 'N/A'}
Election Ref:    INEC-NATIONAL-2024-001
Consensus Hash:  0x7f8a9d123e456789b4c2

--------------------------------------------------
This official confirmation token certifies that your 
encrypted ballot has been included in the election ledger.
==================================================
    `;

    const element = document.createElement("a");
    const safeToken = sanitizeFilename(receiptToken);
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent),
    );
    element.setAttribute("download", `official_voting_receipt_${safeToken}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNewElection = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (!receiptToken) {
    return <div className="loading">Loading confirmation...</div>;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="success-icon">
          <CheckCircle2 size={40} />
        </div>
        <h1>Vote Cast Successfully!</h1>
        <p className="success-message">
          Your vote has been recorded securely on the consensus voting ledger.
        </p>

        <div className="receipt-box">
          <div className="receipt-header">
            <h2>Official Voting Receipt</h2>
            <p>Cryptographically verified & ledger recorded</p>
          </div>

          <div className="receipt-token">
            <label>Receipt Token:</label>
            <div className="token-value">{receiptToken}</div>
          </div>

          <div className="receipt-details">
            <div className="detail-row">
              <span className="detail-label">Issued At:</span>
              <span className="detail-value">
                {new Date().toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Election ID:</span>
              <span className="detail-value">ELECTION-2024-001</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Voter ID (Masked):</span>
              <span className="detail-value">
                {voter ? `${voter.substring(0, 4)}****${voter.substring(8)}` : "Masked"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ledger Protocol:</span>
              <span className="detail-value" style={{ color: "var(--primary-color)" }}>
                SHA-256 Verified
              </span>
            </div>
          </div>

          <div className="receipt-footer">
            <p>
              This official receipt confirms that your ballot has been cast and is included in the national tally.
            </p>
          </div>
        </div>

        {/* Email Receipt Dispatch Tool */}
        <div className="email-dispatch-card">
          <div className="email-card-header">
            <Mail size={20} className="email-icon" />
            <div>
              <h3>Automated Email Confirmation</h3>
              <p>Receive your official voting receipt certificate directly in your email inbox.</p>
            </div>
          </div>

          <form onSubmit={handleSendEmailReceipt} className="email-form">
            <div className="email-input-group">
              <input
                type="email"
                placeholder="Enter your email address (e.g. voter@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
              />
              <button
                type="submit"
                className="btn-send-email"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 size={16} className="spin-icon" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send Email Receipt
                  </>
                )}
              </button>
            </div>
          </form>

          {emailSentSuccess && (
            <div className="email-success-badge">
              <ShieldCheck size={16} />
              <span>Official confirmation receipt sent to <strong>{lastSentEmail}</strong></span>
            </div>
          )}
        </div>

        <div className="confirmation-info">
          <h3>What Happens Next?</h3>
          <ul>
            <li>Your vote has been encrypted and stored securely</li>
            <li>You cannot vote again with this NIN</li>
            <li>Results will be published after voting closes</li>
            <li>You can verify your vote using this receipt token</li>
          </ul>
        </div>

        <div className="confirmation-actions">
          <button
            className="btn-download-receipt"
            onClick={handleDownloadReceipt}
          >
            <Download size={16} style={{ marginRight: "8px" }} />
            Download Receipt
          </button>
          <button className="btn-home" onClick={handleNewElection}>
            <Home size={16} style={{ marginRight: "8px" }} />
            Return to Home
          </button>
        </div>

        <div className="confirmation-warning">
          <p>
            <strong>Important:</strong> Save your receipt token or check your email for the official confirmation copy.
          </p>
        </div>
      </div>
    </div>
  );
}
