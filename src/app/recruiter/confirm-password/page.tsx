import RecruiterResetPasswordForm from "@/components/recruiter/RecruiterResetPasswordForm";

// Legacy route — kept for backward compatibility. The canonical route the
// backend now emails is /recruiter/auth/reset-password. Both render the same form.
export default function RecruiterConfirmPassword() {
  return <RecruiterResetPasswordForm />;
}
