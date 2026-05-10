import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <SignIn
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#2563eb",
            colorBackground: "#ffffff",
            colorText: "#0f172a",
            colorTextSecondary: "#64748b",
            colorInputBackground: "#ffffff",
            borderRadius: "0.75rem",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        }}
      />
    </div>
  );
}
