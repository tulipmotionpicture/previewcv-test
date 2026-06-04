import ResetPasswordForm from "@/components/ResetPasswordForm";

// Route the backend's candidate password-reset email links to:
//   https://previewcv.com/candidate/auth/reset-password?token=...
export default function CandidateResetPasswordPage() {
  return <ResetPasswordForm variant="candidate" />;
}
