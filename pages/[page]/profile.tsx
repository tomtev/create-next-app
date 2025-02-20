import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import { PageData } from '@/types';
import { PrivyClient } from "@privy-io/server-auth";
import { Redis } from "@upstash/redis";
import Loader from "@/components/ui/loader";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

// Dynamically import the parent page
const ParentPage = dynamic(() => import('../[page]'), {
  loading: () => <div className="fixed inset-0 flex items-center justify-center"><Loader /></div>,
  ssr: true, // We want SSR for the parent page
});

interface ProfilePageProps {
  pageData: PageData;
  slug: string;
  error?: string;
  isOwner: boolean;
}

// Reuse the same server-side logic from the parent page
export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (context) => {
  // Import the getServerSideProps from the parent page to reuse the logic
  const parentGetServerSideProps = (await import('../[page]')).getServerSideProps;
  return parentGetServerSideProps(context);
};

export default function ProfilePage(props: ProfilePageProps) {
  const router = useRouter();
  const { page } = router.query;

  return (
    <>
      {/* Render the parent page in the background */}
      <div className="pointer-events-none">
        <ParentPage {...props} />
      </div>

      {/* Render the drawer */}
      <Drawer
        open={true}
        onOpenChange={(open) => {
          if (!open) router.push(`/${page}`);
        }}
        direction="right"
      >
        <DrawerContent>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/${page}`)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <p>This is a drawer route example for page: {page}</p>
              <p>You can add any content here and it will be rendered in the drawer.</p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
} 