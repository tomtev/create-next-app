import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { Toaster } from "@/components/ui/toaster";
import { GlobalProvider } from "@/lib/context";
import AppMenu from "@/components/AppMenu";
import "../styles/globals.css";
import "../styles/page.css";

function AppContent({ Component, pageProps }: AppProps) {
  return (
    <GlobalProvider>
      <div className="fixed top-2 left-2 z-20">
        <AppMenu />
      </div>
      <Component {...pageProps} />
      <Toaster />
    </GlobalProvider>
  );
}

function MyApp(props: AppProps) {
  const solanaConnectors = toSolanaWalletConnectors();

  return (
    <>
      <Head>
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/favicons/manifest.json" />
        <meta name="description" content="Tokenize yourself" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          appearance: {
            // Defaults to true
            walletChainType: "solana-only",
            walletList: ["phantom", "solflare"],
            theme: "light",
            accentColor: "#86EFAC",
          },
          solanaClusters: [
            {
              name: "mainnet-beta",
              rpcUrl:
                "https://mainnet.helius-rpc.com/?api-key=3951525f-0f9c-4aab-b67b-7dbe9d79e547",
            },
          ],
          embeddedWallets: {
            solana: {
              createOnLogin: "all-users"
            },
          },
          externalWallets: {
            solana: { connectors: solanaConnectors },
          },
        }}>
        <AppContent {...props} />
      </PrivyProvider>
    </>
  );
}

export default MyApp;
