import RecruiterResetPasswordForm from "@/components/recruiter/RecruiterResetPasswordForm";

// Route the backend's password-reset email links to:
//   https://previewcv.com/recruiter/auth/reset-password?token=...
export default function RecruiterResetPasswordPage() {
  return <RecruiterResetPasswordForm />;
}
