import { useLogin } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import CreatePageModal from "@/components/CreatePageModal";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useState } from "react";
import { useGlobalContext } from "@/lib/context";

export default function HomePage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => {
      router.replace(router.asPath);
    },
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { userPages, isLoadingPages, walletAddress, isAuthenticated } = useGlobalContext();

  const handleDashboardClick = () => {
    window.dispatchEvent(new CustomEvent("openAppMenu"));
  };

  return (
    <>
      <Head>
        <title>Page.fun - Linktree alternative for tokens and memes.</title>
      </Head>

      <main className="flex min-h-screen bg-muted min-w-full grid sm:grid-cols-2">
        <div className="flex flex-1 min-h-[40vh] py-5 items-center text-center sm:text-left max-w-[450px] px-4 w-full mx-auto">
          <div>
            <h1 className="text-xl mb-4 flex items-center gap-2 justify-center sm:justify-start">
              <Logo className="w-7 h-7 text-primary" />
              page.fun
              <span className="text-xs opacity-75 text-green-600">beta</span>
            </h1>
            <h1 className="text-4xl sm:text-6xl font-semibold mb-6">
              The page that connects all your socials. 
            </h1>
            <p className="text-xl opacity-75 mb-6 pr-10">Simplest way to add token utility to memes, AI agents and personal tokens.</p>
            {typeof isAuthenticated === 'undefined' ? (
              <Button variant="skeleton" disabled className="w-[180px]">
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <Button
                onClick={isLoadingPages ? undefined : (
                  userPages.length > 0
                    ? handleDashboardClick
                    : () => setShowCreateModal(true)
                )}
                disabled={isLoadingPages}
              >
                {isLoadingPages
                  ? "Loading..."
                  : userPages.length > 0
                  ? "My Pages"
                  : "Create Page"}
              </Button>
            ) : (
              <Button onClick={login}>
                <span>Get your </span>
                <span className="-ml-1">page.fun</span>
                <span className="opacity-75 -mx-1 opacity-50">/</span>
                <span className="text-green-300">token</span>
              </Button>
            )}
          </div>
        </div>
        <div className="bg-primary relative min-h-[60vh] overflow-hidden border-t sm:border-t-0 sm:border-l sm:border-zinc-700">
          <Image
            src="/bg.webp"
            alt="Page.fun"
            fill
            className="object-cover opacity-100"
          />

          {/* Marquee container */}
          <div className="absolute top-5 sm:top-1/2 left-0 sm:-translate-y-1/2 w-full z-30">
            <div className="relative flex overflow-x-hidden py-5">
              <div
                style={{ "--marquee-duration": "30s" } as React.CSSProperties}
                className="animate-marquee whitespace-nowrap flex gap-4">
                <PhoneFrame color="white" />
                <PhoneFrame color="gold" />
                <PhoneFrame color="silver" />
                <PhoneFrame color="rose" />
                <PhoneFrame color="blue" />
              </div>

              <div
                style={{ "--marquee-duration": "30s" } as React.CSSProperties}
                className="absolute pl-4 top-5 animate-marquee2 whitespace-nowrap flex gap-4">
                <PhoneFrame color="white" />
                <PhoneFrame color="gold" />
                <PhoneFrame color="silver" />
                <PhoneFrame color="rose" />
                <PhoneFrame color="blue" />
              </div>
            </div>
          </div>

          <div className="absolute text-white text-xs bottom-3 left-[50%] -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md">© Page.fun - $page.</span>
          </div>
        </div>
      </main>

      {showCreateModal && walletAddress && (
        <CreatePageModal
          open={showCreateModal}
          walletAddress={walletAddress}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      <Toaster />
    </>
  );
}
