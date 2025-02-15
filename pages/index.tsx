<<<<<<< Updated upstream
import Portal from "../components/graphics/portal";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
=======
import { useLogin } from "@privy-io/react-auth";
>>>>>>> Stashed changes
import Head from "next/head";
import { useRouter } from "next/router";
<<<<<<< Updated upstream
import { Toaster } from '@/components/ui/toaster';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    // Since we're not redirecting to dashboard anymore, just return the claims
    return { props: {} };
  } catch (error) {
    return { props: {} };
  }
};

=======
import { Toaster } from "@/components/ui/toaster";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import CreatePageModal from "@/components/CreatePageModal";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useState } from "react";
import { useGlobalContext } from "@/lib/context";

>>>>>>> Stashed changes
export default function HomePage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => {
      router.replace(router.asPath);
    },
  });
<<<<<<< Updated upstream
  const { ready, authenticated } = usePrivy();
=======
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { userPages, isLoadingPages, walletAddress, isAuthenticated } = useGlobalContext();

  const handleDashboardClick = () => {
    window.dispatchEvent(new CustomEvent("openAppMenu"));
  };
>>>>>>> Stashed changes

  return (
    <>
      <Head>
        <title>{authenticated ? 'Page.fun' : 'Login · Page.fun'}</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
<<<<<<< Updated upstream
            <div>
              <Portal style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="mt-6 flex flex-col items-center text-center">
              <h1 className="text-2xl font-semibold mb-4">Welcome to Page.fun!</h1>
              {authenticated ? (
                <p className="text-gray-600 mb-4">
                  Create and manage your pages using the menu in the top right corner.
                </p>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Connect your wallet to get started with your personalized page.
                  </p>
                  <button
                    className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                    onClick={login}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
=======
            <h1 className="text-xl mb-4 flex items-center gap-2 justify-center sm:justify-start">
              <Logo className="w-8 h-8 hidden sm:block" />
              page.fun
              <span className="text-xs opacity-75 text-green-600">beta</span>
            </h1>
            <h1 className="text-4xl font-semibold mb-4">
              Tokenize yourself, memes and AI bots
            </h1>
            <p className="text-lg opacity-75 mb-4">A Linktree alternative for Solana tokens.</p>
            {isAuthenticated ? (
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
          <div className="absolute top-5 sm:top-1/2 left-0 sm:-translate-y-1/2 w-full z-50">
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
>>>>>>> Stashed changes
          </div>
        </div>
      </main>

<<<<<<< Updated upstream
=======
      {showCreateModal && walletAddress && (
        <CreatePageModal
          open={showCreateModal}
          walletAddress={walletAddress}
          onClose={() => setShowCreateModal(false)}
        />
      )}

>>>>>>> Stashed changes
      <Toaster />
    </>
  );
}
