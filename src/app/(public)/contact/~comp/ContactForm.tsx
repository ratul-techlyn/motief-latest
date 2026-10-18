"use client";
import { trackFormSubmission } from "@/lib/marketing-analytics";
import { ChevronDownIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaArrowRightLong } from "react-icons/fa6";

// TypeScript declarations for Google reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
      ready: (callback: () => void) => void;
    };
  }
}

const interests = [
  { id: 1, label: "Incubation Program" },
  { id: 2, label: "Consultation" },
  { id: 3, label: "Acceleration Program" },
  { id: 4, label: "One-off Help" },
  { id: 5, label: "Marketing Strategy" },
  { id: 6, label: "Branding & Strategy" },
  { id: 7, label: "International Expansions" },
  { id: 8, label: "E-commerce Solutions" },
  { id: 9, label: "PulseB2B" },
];

const companySizes = [
  { id: 1, label: "Startup" },
  { id: 2, label: "Under $50,000 /MONTH" },
  { id: 3, label: "$50,000 - $100,000 /MONTH" },
  { id: 4, label: "$100,000 - $150,000 /MONTH" },
  { id: 5, label: "$200,000 - $250,000 /MONTH" },
  { id: 6, label: "$250,000 - $300,000 /MONTH" },
  { id: 7, label: "Over $300,000 /MONTH" },
];

const engagementBudgets = [
  { id: 1, label: "Under $100,000" },
  { id: 2, label: "$100,000 - $199,999" },
  { id: 3, label: "$200,000 - $299,999" },
  { id: 4, label: "$300,000 - $399,999" },
  { id: 5, label: "$400,000 - $499,999" },
  { id: 6, label: "$500,000+" },
];

const ContactForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    brand: "",
    website: "",
    email: "",
    phone: "",
    interest: "",
    budget: "",
    engagementBudget: "",
    about: "",
  });

  const [emptySubmitWarning, setEmptySubmitWarning] = useState(false);
  const [partialMessage, setPartialMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaScore, setCaptchaScore] = useState<number | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isCaptchaLoaded, setIsCaptchaLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check if reCAPTCHA is loaded
  useEffect(() => {
    const checkRecaptcha = () => {
      if (window.grecaptcha) {
        setIsCaptchaLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkRecaptcha, 500);
      }
    };

    checkRecaptcha();
  }, []);

  // Execute reCAPTCHA v3 and check score
  const executeCaptcha = async () => {
    if (!isCaptchaLoaded || !window.grecaptcha) {
      console.error("reCAPTCHA not loaded");
      return false;
    }

    setIsVerifying(true);

    try {
      // Ensure grecaptcha is ready
      await new Promise<void>((resolve) => {
        window.grecaptcha.ready(() => resolve());
      });

      const token = await window.grecaptcha.execute(
        "6LfeGAcsAAAAADHjgdLeT2qEY210QPD9dN25f3KQ",
        {
          action: "submit_form",
        },
      );

      // Verify the token with your backend to get the score
      try {
        const response = await fetch("/api/verify-captcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error("Verification service unavailable");
        }

        const data = await response.json();

        if (data.success) {
          setCaptchaScore(data.score);
          setCaptchaToken(token);

          // Show captcha challenge if score is low (suspicious activity)
          if (data.score < 0.5) {
            setShowCaptcha(true);
            setIsVerifying(false);
            return false; // Require additional verification
          }

          setIsVerifying(false);
          return true; // High score, no challenge needed
        } else {
          console.error("reCAPTCHA verification failed");
          return false;
        }
      } catch (error) {
        console.error("Verification API error, using fallback:", error);
        // Fallback: assume medium risk and show challenge
        setCaptchaScore(0.3);
        setCaptchaToken(token);
        setShowCaptcha(true);
        setIsVerifying(false);
        return false;
      }
    } catch (error) {
      console.error("reCAPTCHA execution error:", error);
      setIsVerifying(false);
      return false;
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const values = Object.values(form);
    const allEmpty = values.every((val) => !val || val.trim() === "");

    if (allEmpty) {
      setEmptySubmitWarning(true);
      setErrors({});
      return false;
    }

    setEmptySubmitWarning(false); // clear warning if partially filled

    if (!form.firstName)
      newErrors.firstName = "Don't be shy—let us know who you are.";
    if (!form.lastName)
      newErrors.lastName = "Last name's missing. We're big on relationships.";
    if (!form.brand) newErrors.brand = "Your brand deserves to be named.";
    if (!form.website)
      newErrors.website = "Your digital home—don't leave it blank.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email) {
      newErrors.email = "Drop that email so we can actually talk.";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Hmm, that doesn't look like a valid email.";
    }
    if (!form.phone) newErrors.phone = "Phone number helps us connect faster.";
    if (!form.interest)
      newErrors.interest = "We need to know what sparks your interest.";
    if (!form.budget) newErrors.budget = "Give us a ballpark—no pressure.";
    if (!form.engagementBudget)
      newErrors.engagementBudget = "Pick a range—it helps us plan the right team.";
    if (!form.about)
      newErrors.about = "Feel free to rant, dream, or pitch here.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsSubmitting(true);

    const filledCount = Object.values(form).filter(
      (val) => val.trim() !== "",
    ).length;

    if (filledCount === 0) {
      setPartialMessage("Whoops—can't send a blank canvas.");
      setIsSubmitting(false);
      return;
    }

    if (filledCount === 1) {
      setPartialMessage(
        "Just one field? We're intrigued... but not quite ready.",
      );
      setIsSubmitting(false);
      return;
    }

    if (filledCount > 1 && filledCount < Object.keys(form).length) {
      setPartialMessage("Getting warmer... a few more details would be fire.");
      setIsSubmitting(false);
      return;
    }

    // All fields are filled, validate and submit
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    // Execute reCAPTCHA v3 verification
    const captchaSuccess = await executeCaptcha();

    // If score is low, show challenge but don't submit yet
    if (!captchaSuccess && captchaScore !== null && captchaScore < 0.5) {
      setIsSubmitting(false);
      setPartialMessage("Please complete the security check to continue.");
      return;
    }

    // If captcha verification failed completely
    if (!captchaSuccess && captchaScore === null) {
      setIsSubmitting(false);
      setPartialMessage("Security verification failed. Please try again.");
      return;
    }

    try {
      // Clear messages
      setPartialMessage("");

      // Track form submission to all marketing platforms
      trackFormSubmission("contact_form", {
        ...form,
        source: "website_contact_form",
        timestamp: new Date().toISOString(),
      });

      // Submit to HubSpot API
      const hubspotResponse = await fetch("/api/hubspot/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      // Submit to Meta Conversion API
      const metaResponse = await fetch("/api/meta/conversion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "Lead",
          eventSourceUrl: window.location.href,
          userData: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            clientIpAddress: "", // This would be populated server-side
            clientUserAgent: navigator.userAgent,
          },
          customData: {
            brand: form.brand,
            website: form.website,
            interest: form.interest,
            budget: form.budget,
            engagement_budget: form.engagementBudget,
            content_name: "Contact Form",
            content_category: "Lead Generation",
          },
        }),
      });

      // Send email notification to ashome@wemotif.com
      const emailResponse = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (hubspotResponse.ok) {
        setSubmitSuccess(true);
        setPartialMessage("🎉 Thanks! We'll be in touch soon.");

        // Reset form after successful submission
        setTimeout(() => {
          setForm({
            firstName: "",
            lastName: "",
            brand: "",
            website: "",
            email: "",
            phone: "",
            interest: "",
            budget: "",
            engagementBudget: "",
            about: "",
          });
          setSubmitSuccess(false);
          setSubmitted(false);
          setPartialMessage("");
        }, 3000);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setPartialMessage("Oops! Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        <Input
          id="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={updateField}
          error={errors.firstName}
          onSubmit={handleSubmit}
        />
        <Input
          id="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={updateField}
          error={errors.lastName}
          onSubmit={handleSubmit}
        />

        <Input
          id="brand"
          placeholder="Brand Name"
          value={form.brand}
          onChange={updateField}
          error={errors.brand}
          onSubmit={handleSubmit}
        />

        <Input
          id="website"
          placeholder="Website"
          value={form.website}
          onChange={updateField}
          error={errors.website}
          onSubmit={handleSubmit}
        />
        
        <div className="col-span-2 grid gap-2 sm:col-span-6">
          <Input
            id="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={updateField}
            error={errors.phone}
            onSubmit={handleSubmit}
          />
          <Input
            id="email"
            placeholder="Email Address"
            value={form.email}
            onChange={updateField}
            error={errors.email}
            onSubmit={handleSubmit}
          />
          <Select
            id="interest"
            value={form.interest}
            onChange={updateField}
            placeholder="Interested In"
            options={interests}
            error={errors.interest}
          />
          <Select
            id="budget"
            value={form.budget}
            onChange={updateField}
            placeholder="Business Stage"
            options={companySizes}
            error={errors.budget}
          />
          <Select
            id="engagementBudget"
            value={form.engagementBudget}
            onChange={updateField}
            placeholder="Annual Engagement Budget"
            options={engagementBudgets}
            error={errors.engagementBudget}
          />
        </div>

        <div className="col-span-2 grid gap-2 sm:col-span-6">
          <textarea
            id="about"
            name="about"
            value={form.about}
            onChange={(e) => updateField("about", e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.ctrlKey || e.metaKey) &&
                !isSubmitting
              ) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={3}
            placeholder="Anything If You Want To Know"
            className={`block w-full rounded-[5px] px-3 py-3 bg-[#131313] text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-white focus:bg-[#232326] focus:text-white focus:placeholder:text-gray-300 transition-all duration-200 ${
              errors.about ? "border-[#ED5F09]" : "border-[#4f4f4f69]"
            } border`}
          />
          {errors.about && (
            <p className="text-sm mt-1 text-[#ED5F09]">{errors.about}</p>
          )}
        </div>
      </div>

      <div className="text-end mt-2">
        <div className="flex flex-col md:flex-row wrap items-start">
          {/* Fallback message on left side */}
          {partialMessage && (
            <div className="w-full md:w-fit shrink-0 text-center text-white text-sm/relaxed px-4 py-2 rounded-md bg-white/5 backdrop-blur-sm animate-fadeInUp">
              {partialMessage}
            </div>
          )}

          <div className="mb-2 w-full jb_captcha_box">
            {captchaScore !== null && (
              <div className="text-xs text-gray-400">
                Security Score: {captchaScore.toFixed(2)}
                {captchaScore >= 0.7 && (
                  <span className="text-green-400">✓ High</span>
                )}
                {captchaScore >= 0.5 && captchaScore < 0.7 && (
                  <span className="text-yellow-400">⚠ Medium</span>
                )}
                {captchaScore < 0.5 && (
                  <span className="text-red-400">
                    ✗ Low - Challenge Required
                  </span>
                )}
              </div>
            )}
            {isVerifying && (
              <div className="mb-2 text-xs text-blue-400">
                🔍 Verifying security check...
              </div>
            )}
            {showCaptcha && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Please complete the security challenge:
                </p>
                <div
                  className="g-recaptcha"
                  data-sitekey="6LdYGQcsAAAAAJYe89ZM4HDnrDvAzP4DnIFHLZUc"
                ></div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting || isVerifying || (showCaptcha && !captchaToken)
            }
            className={`flex shrink-0 ml-auto justify-between items-center pl-4 pr-2 py-2 w-auto sm:w-auto rounded-l-md rounded-tr-md rounded-br-2xl text-white ${
              isSubmitting || isVerifying
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#131313] hover:bg-gray-950 hover:scale-105 focus:bg-gray-950 focus:scale-105 focus:border-white focus:border"
            } transition-all duration-200`}
          >
            {isVerifying
              ? "Verifying..."
              : isSubmitting
                ? "Sending..."
                : "Send Email"}
            <span
              className={`ml-4 px-3 py-3 rounded-l-md rounded-tr-md rounded-br-xl ${
                isSubmitting || isVerifying
                  ? "bg-gray-500"
                  : "bg-[#232326] hover:bg-gray-950 focus:bg-gray-950"
              } transition-colors`}
            >
              <FaArrowRightLong color="#ff0000" />
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;

const Input = ({ id, placeholder, value, onChange, error, onSubmit }: any) => (
  <div className="col-span-1 sm:col-span-3">
    <input
      id={id}
      name={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onSubmit) {
          e.preventDefault();
          onSubmit(e);
        }
      }}
      aria-label={placeholder}
      className={`block w-full rounded-[5px] px-3 py-3 bg-[#131313] text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-white focus:bg-[#232326] focus:text-white focus:placeholder:text-gray-300 transition-all duration-200 ${
        error ? "border-[#ED5F09]" : "border-[#4f4f4f69]"
      } border`}
    />
    {error && <p className="text-sm mt-1 text-[#ED5F09]">{error}</p>}
  </div>
);

const Select = ({ id, value, onChange, options, placeholder, error }: any) => (
  <div className="col-span-1 sm:col-span-3 grid grid-cols-1">
    <select
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
      aria-label={placeholder}
      className={`col-start-1 row-start-1 w-full appearance-none rounded-md bg-[#131313] py-3 pl-3 pr-8 text-base text-white focus:outline-none focus:ring-0 focus:border-white focus:bg-[#232326] focus:text-white transition-all duration-200 ${
        error ? "border-[#ED5F09]" : "border-[#4f4f4f69]"
      } border`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.id} value={opt.label}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDownIcon
      aria-hidden="true"
      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400"
    />
    {error && <p className="text-sm mt-1 text-[#ED5F09]">{error}</p>}
  </div>
);
