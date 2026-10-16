import { useState } from "react";
import { Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const faqData = [
  {
    id: 1,
    category: "general",
    question: "What is the official e.Voting Platform?",
    answer: "The e.Voting Platform is the national digital election portal developed to allow verified citizens to securely cast their votes online or at digital polling stations with end-to-end cryptographic verification and zero-knowledge privacy."
  },
  {
    id: 2,
    category: "security",
    question: "How is my vote kept strictly anonymous?",
    answer: "Your identity (NIN/VIN) is verified separately from your ballot choices. Once verified, the system generates a single-use cryptographic voting token. The record of your vote is stored with a SHA-256 hash digest on an immutable ledger, completely detached from your personal profile."
  },
  {
    id: 3,
    category: "general",
    question: "Who is eligible to vote in the 2026 Elections?",
    answer: "Any citizen aged 18 years or older who is registered on the National Voter Register and possesses a valid National Identification Number (NIN) or Voter Identification Number (VIN)."
  },
  {
    id: 4,
    category: "procedure",
    question: "Can I edit or change my vote after clicking Submit?",
    answer: "No. To maintain complete ledger integrity and prevent coercion, once a ballot is cryptographically sealed and submitted, it cannot be modified or re-cast."
  },
  {
    id: 5,
    category: "security",
    question: "How can I verify that my vote was accurately recorded?",
    answer: "Upon successful ballot submission, you receive a unique Digital Vote Verification Receipt containing a SHA-256 hash digest. You can check this receipt on the Public Ledger Verifier at any time to confirm inclusion without revealing your choices."
  },
  {
    id: 6,
    category: "procedure",
    question: "What happens if my network connection breaks during voting?",
    answer: "If your session disconnects before you confirm submission on the Review page, your choices remain in secure temporary session memory on your device. Simply log back in before the polling deadline to complete submission."
  },
  {
    id: 7,
    category: "verification",
    question: "What is a Voter Authorization Token?",
    answer: "A Voter Authorization Token is an encrypted token generated upon identity verification that authorizes a single ballot submission for your registered polling unit."
  },
  {
    id: 8,
    category: "security",
    question: "Is vote buying or ballot screenshots permitted?",
    answer: "Strictly prohibited. Electoral law prohibits capturing screenshots of marked digital ballots or sharing tokens to claim monetary rewards. Any detected violation results in invalidation and legal prosecution."
  }
];

export default function GuideFaqTab() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = faqCategory === "all" || faq.category === faqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="guide-tab-content">
      <div className="section-header-block">
        <h2>Frequently Asked Questions</h2>
        <p>Search or filter through common queries regarding voting procedure, security, and verification.</p>
      </div>

      <div className="faq-filter-bar">
        <div className="faq-search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="faq-search-input"
          />
        </div>

        <div className="faq-category-pills">
          <button
            className={`faq-pill ${faqCategory === "all" ? "active" : ""}`}
            onClick={() => setFaqCategory("all")}
          >
            All Questions
          </button>
          <button
            className={`faq-pill ${faqCategory === "general" ? "active" : ""}`}
            onClick={() => setFaqCategory("general")}
          >
            General Info
          </button>
          <button
            className={`faq-pill ${faqCategory === "procedure" ? "active" : ""}`}
            onClick={() => setFaqCategory("procedure")}
          >
            Voting Process
          </button>
          <button
            className={`faq-pill ${faqCategory === "security" ? "active" : ""}`}
            onClick={() => setFaqCategory("security")}
          >
            Privacy & Security
          </button>
        </div>
      </div>

      <div className="faq-accordion-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = expandedFaq === faq.id;
            return (
              <div key={faq.id} className={`faq-accordion-item ${isOpen ? "open" : ""}`}>
                <button className="faq-question-btn" onClick={() => toggleFaq(faq.id)}>
                  <span className="faq-question-text">{faq.question}</span>
                  <span className="faq-icon-toggle">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer-content">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="faq-no-results">
            <AlertCircle size={24} />
            <p>No questions matched your search criteria. Try a different keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}
