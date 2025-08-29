import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen rainbow-tech-bg-enhanced flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BookNook</h1>
          <p className="text-gray-600">Discover tiny libraries around the world</p>
        </div>
        
        {/* Sign In Form */}
        <div className="flex justify-center relative z-10">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                headerTitle: "text-2xl font-bold text-gray-900 mb-2",
              }
            }}
            redirectUrl="/map"
          />
        </div>
        
       
      </div>
    </div>
  );
}
