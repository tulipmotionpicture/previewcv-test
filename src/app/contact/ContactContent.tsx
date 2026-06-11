"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { load } from "recaptcha-v3";
import { toast } from "react-hot-toast";
import FloatingHeader from "@/components/FloatingHeader";
// Validation schema matching API requirements
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be under 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be under 5000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const ContactUs = () => {
  const [recaptchaInstance, setRecaptchaInstance] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  // Load reCAPTCHA v3
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      return;
    }

    const loadRecaptcha = async () => {
      try {
        const recaptcha = await load(siteKey);
        setRecaptchaInstance(recaptcha);
      } catch (error) {
        toast.error("Failed to load reCAPTCHA. Please refresh the page.");
      }
    };

    loadRecaptcha();
  }, []);

  const onSubmit = async (data: ContactForm) => {
    try {
      if (!recaptchaInstance) {
        toast.error("reCAPTCHA not loaded. Please refresh the page.");
        return;
      }

      // Execute reCAPTCHA v3
      const token = await recaptchaInstance.execute("contact_form");

      // Submit form with reCAPTCHA token
      const payload = {
        ...data,
        recaptcha_token: token,
      };

      await api.request("/contact/send", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to send message. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-white min-h-screen py-16 px-3 md:px-12 lg:px-24">
      <FloatingHeader
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
        hideOnScroll={true}
      />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold color2">
            Get in <span className="hero-span">Touch</span>
          </h2>
          <p className="text-gray-500 mt-4 text-md max-w-2xl m-auto">
            We'd love to hear from you. Whether you have a question, feedback,
            or just want to chat our team is here to help!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12  gap-10">
          {/* Contact Info */}
          {/* <div className="space-y-6">
            <h3 className="text-xl font-semibold color2">Reach Out Directly</h3>
            <p className="color2 text-sm ml-3">📧 support@letsmakecv.com</p>
            <p className="color2 text-sm ml-3">📞 +91-98765xxxx</p>
            <p className="color2 text-sm ml-3">📍 Mumbai, India</p>
            <div className="rounded-lg overflow-hidden mt-4">
              <iframe
                title="Map"
                className="w-full h-52 border-0"
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Mumbai,India"
              />
            </div>
          </div> */}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1 color2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 color2 color2">
                  Your Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 color2">
                Subject
              </label>
              <input
                type="text"
                placeholder="About your request..."
                {...register("subject")}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 ${errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 color2">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Write your message here..."
                {...register("message")}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm resize-none focus:ring-2 focus:ring-blue-500 ${errors.message ? "border-red-500" : "border-gray-300"
                  }`}
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={isSubmitting || !recaptchaInstance}
                className={`px-6 py-3 rounded-lg font-medium transition ${isSubmitting || !recaptchaInstance
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {!recaptchaInstance && (
                <p className="text-sm text-gray-600 mt-2">
                  Loading security verification...
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
