import ResetPasswordForm from "@/components/ResetPasswordForm";

// Thin wrapper kept so the recruiter routes can keep importing this path.
// The actual form is the shared ResetPasswordForm.
export default function RecruiterResetPasswordForm() {
  return <ResetPasswordForm variant="recruiter" />;
}
