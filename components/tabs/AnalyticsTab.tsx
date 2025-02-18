import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PageData } from "@/types";

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  clickedLinks: Array<{
    itemId: string;
    timestamp: number;
    isGated: boolean;
  }>;
}

interface AnalyticsTabProps {
  pageDetails: PageData | null;
}

export function AnalyticsTab({ pageDetails }: AnalyticsTabProps) {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const slug = router.query.page || router.query.slug;
      if (!slug || typeof slug !== 'string') return;

      try {
        // Fetch visit data
        const visitResponse = await fetch(`/api/analytics/visits/${slug}`);
        const visitData = await visitResponse.json();

        // Fetch click data
        const clickResponse = await fetch(`/api/analytics/clicks/${slug}`);
        const clickData = await clickResponse.json();

        setAnalyticsData({
          totalVisits: visitData.totalVisits || 0,
          uniqueVisitors: visitData.uniqueVisitors || 0,
          clickedLinks: clickData.clicks || [],
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [router.query]);

  if (isLoading) {
    return <div className="p-4">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="p-4">No analytics data available</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Visits</h3>
          <p className="mt-2 text-3xl font-bold">{analyticsData.totalVisits}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
          <p className="mt-2 text-3xl font-bold">{analyticsData.uniqueVisitors}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Link Clicks</h3>
        <div className="border rounded-lg divide-y">
          {analyticsData.clickedLinks.map((click, index) => (
            <div key={index} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{click.itemId}</p>
                <p className="text-sm text-gray-500">
                  {new Date(click.timestamp).toLocaleString()}
                </p>
              </div>
              {click.isGated && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Gated
                </span>
              )}
            </div>
          ))}
          {analyticsData.clickedLinks.length === 0 && (
            <p className="p-4 text-gray-500">No clicks recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
} 