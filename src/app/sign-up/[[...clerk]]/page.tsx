import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen rainbow-tech-bg-enhanced flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">BookNook</h1>
          <p className="text-white/90 text-lg drop-shadow-md">Join the global network of tiny libraries</p>
        </div>
        
        {/* Sign Up Form */}
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                headerTitle: "text-2xl font-bold text-white mb-2",
                headerSubtitle: "text-white/80 mb-6",
                background: "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6",
                // Add more Clerk-specific styling
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                formFieldInput: "bg-white/20 border-white/30 text-white placeholder-white/60",
                formFieldLabel: "text-white/90",
                footerActionLink: "text-blue-300 hover:text-blue-200",
                dividerLine: "bg-white/20",
                dividerText: "text-white/60"
              },
              variables: {
                colorPrimary: "#2563eb",
                colorBackground: "rgba(255, 255, 255, 0.1)",
                colorText: "#ffffff",
                colorTextSecondary: "rgba(255, 255, 255, 0.8)"
              }
            }}
            redirectUrl="/map"
          />
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">Start contributing to your community today</p>
        </div>
      </div>
    </div>
  );
}

/*
  ALTERNATIVE: For full styling control, use embedded Clerk:
  
  <SignUp 
    appearance={{
      layout: {
        socialButtonsPlacement: "bottom",
        showOptionalFields: false,
        privacyPageUrl: "/privacy",
        termsPageUrl: "/terms"
      },
      elements: {
        // Your custom styling here
      }
    }}
    routing="path"
    path="/sign-up"
  />
  
  This keeps users on your domain and gives you full CSS control.
*/
