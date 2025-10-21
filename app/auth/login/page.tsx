import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#070B34]">
      {/* Background video */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/BG.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 items-start justify-start p-16 pt-20">
          <div className="max-w-md space-y-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5">
                <Image 
                  src="/NEDApayLogo.png" 
                  alt="NedaPay" 
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">NedaPay</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-0">
              <h1 className="text-5xl font-semibold text-white leading-tight mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', letterSpacing: '-0.02em' }}>
                <span className="inline-block animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  Pay anywhere,
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  Settle everywhere
                </span>
              </h1>
            </div>

            {/* Footer text */}
            <div className="absolute bottom-16 left-16 text-sm">
              <p className="text-white/60">Experiencing issues?</p>
              <a href="mailto:support@nedapay.com" className="text-white/90 underline hover:text-white">Get assistance via support@nedapay.com</a>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 lg:pr-16">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
