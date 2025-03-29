import { useQuery } from "@tanstack/react-query";
import { ArtistRevenue } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from "recharts";
import { DollarSign, Users, Percent, TrendingUp, Music, CalendarDays } from "lucide-react";

interface ArtistAnalyticsProps {
  artistId: number;
  isArtistOwner?: boolean;
}

// Engagement data - would come from API in real implementation
const engagementData = [
  { month: 'Jan', engagement: 1200 },
  { month: 'Feb', engagement: 1900 },
  { month: 'Mar', engagement: 3000 },
  { month: 'Apr', engagement: 2780 },
  { month: 'May', engagement: 5000 },
  { month: 'Jun', engagement: 4780 },
];

// Token holder growth data - would come from API in real implementation
const holderGrowthData = [
  { date: '01/25', holders: 18 },
  { date: '02/25', holders: 27 },
  { date: '03/25', holders: 42 },
  { date: '04/25', holders: 56 },
  { date: '05/25', holders: 78 },
];

// Streaming platform data - would come from API in real implementation
const streamingData = [
  { name: 'Spotify', value: 47 },
  { name: 'Apple Music', value: 31 },
  { name: 'YouTube', value: 15 },
  { name: 'Others', value: 7 },
];

const COLORS = ['#FF4D8D', '#8884d8', '#82ca9d', '#ffc658'];

export function ArtistAnalytics({ artistId, isArtistOwner = false }: ArtistAnalyticsProps) {
  // Get the artist revenue data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery<ArtistRevenue>({
    queryKey: [`/api/artists/${artistId}/revenue`],
  });
  
  // Get all token holders for this artist
  const { data: tokenHolders, isLoading: isLoadingHolders } = useQuery<number>({
    queryKey: [`/api/artists/${artistId}/token-holders-count`],
    // Mock implementation until we have the real endpoint
    queryFn: async () => {
      return 78; // Mock token holder count
    }
  });

  // Get monthly listener data - would be from API in real implementation
  const { data: monthlyListeners, isLoading: isLoadingListeners } = useQuery<number>({
    queryKey: [`/api/artists/${artistId}/monthly-listeners`],
    // Mock implementation until we have the real endpoint
    queryFn: async () => {
      return 245789; // Mock monthly listener count
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      compactDisplay: "short"
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card className="bg-black/50 border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70">Total Earnings</CardDescription>
            <CardTitle className="text-2xl text-white flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              {isLoadingRevenue ? (
                <div className="h-8 w-24 bg-primary/20 animate-pulse rounded"></div>
              ) : (
                formatCurrency(revenueData?.totalEarnings || 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-white/60">
              Past Month: {isLoadingRevenue ? (
                <span className="h-4 w-16 bg-primary/20 animate-pulse rounded inline-block"></span>
              ) : (
                formatCurrency(revenueData?.lastMonthEarnings || 0)
              )}
            </div>
          </CardContent>
        </Card>

        {/* Token Holders */}
        <Card className="bg-black/50 border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70">Token Holders</CardDescription>
            <CardTitle className="text-2xl text-white flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              {isLoadingHolders ? (
                <div className="h-8 w-16 bg-primary/20 animate-pulse rounded"></div>
              ) : (
                tokenHolders
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-white/60">
              Growth: <span className="text-green-400">+42% this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Token Distribution */}
        <Card className="bg-black/50 border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70">Token Distribution</CardDescription>
            <CardTitle className="text-2xl text-white flex items-center">
              <Percent className="mr-2 h-5 w-5 text-primary" />
              {isLoadingRevenue ? (
                <div className="h-8 w-16 bg-primary/20 animate-pulse rounded"></div>
              ) : (
                `${revenueData?.distribution.tokenHolders.percentage || 0}%`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-white/60">
              To token holders from total revenue
            </div>
          </CardContent>
        </Card>

        {/* Monthly Listeners */}
        <Card className="bg-black/50 border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70">Monthly Listeners</CardDescription>
            <CardTitle className="text-2xl text-white flex items-center">
              <Music className="mr-2 h-5 w-5 text-primary" />
              {isLoadingListeners ? (
                <div className="h-8 w-24 bg-primary/20 animate-pulse rounded"></div>
              ) : (
                formatNumber(monthlyListeners || 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-white/60">
              <span className="text-green-400">+12.3%</span> from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-black/50 border-primary/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Revenue Over Time</CardTitle>
            <CardDescription className="text-white/70">Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <div className="h-80 bg-primary/10 animate-pulse rounded flex items-center justify-center">
                <div className="text-white/40">Loading revenue data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueData?.monthlyData ? Object.entries(revenueData.monthlyData).map(([month, amount]) => ({
                    month,
                    amount
                  })) : []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                  />
                  <Bar dataKey="amount" fill="#FF4D8D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribution Breakdown */}
        <Card className="bg-black/50 border-primary/30">
          <CardHeader>
            <CardTitle className="text-white">Revenue Distribution</CardTitle>
            <CardDescription className="text-white/70">How earnings are allocated</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <div className="h-64 bg-primary/10 animate-pulse rounded"></div>
            ) : revenueData?.distribution ? (
              <>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Artist', value: revenueData.distribution.artist.percentage },
                          { name: 'Token Holders', value: revenueData.distribution.tokenHolders.percentage },
                          { name: 'Treasury', value: revenueData.distribution.treasury.percentage },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Artist', value: revenueData.distribution.artist.percentage },
                          { name: 'Token Holders', value: revenueData.distribution.tokenHolders.percentage },
                          { name: 'Treasury', value: revenueData.distribution.treasury.percentage },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/80 text-sm">Artist Share</span>
                      <span className="text-white/80 text-sm">
                        {formatCurrency(revenueData.distribution.artist.amount)}
                      </span>
                    </div>
                    <Progress value={revenueData.distribution.artist.percentage} className="h-2 bg-white/10">
                      <div className="h-full bg-[#FF4D8D] rounded-full" />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/80 text-sm">Token Holders</span>
                      <span className="text-white/80 text-sm">
                        {formatCurrency(revenueData.distribution.tokenHolders.amount)}
                      </span>
                    </div>
                    <Progress value={revenueData.distribution.tokenHolders.percentage} className="h-2 bg-white/10">
                      <div className="h-full bg-[#8884d8] rounded-full" />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/80 text-sm">Treasury</span>
                      <span className="text-white/80 text-sm">
                        {formatCurrency(revenueData.distribution.treasury.amount)}
                      </span>
                    </div>
                    <Progress value={revenueData.distribution.treasury.percentage} className="h-2 bg-white/10">
                      <div className="h-full bg-[#82ca9d] rounded-full" />
                    </Progress>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
      
      {isArtistOwner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fan Engagement */}
          <Card className="bg-black/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white">Fan Engagement</CardTitle>
              <CardDescription className="text-white/70">
                Interactions across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }} />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#FF4D8D" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Token Holder Growth */}
          <Card className="bg-black/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white">Token Holder Growth</CardTitle>
              <CardDescription className="text-white/70">
                New investors over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList className="mb-4 bg-black/50">
                  <TabsTrigger value="chart" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Chart
                  </TabsTrigger>
                  <TabsTrigger value="platforms" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Music className="mr-2 h-4 w-4" />
                    Platforms
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={holderGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }} />
                      <Line 
                        type="monotone" 
                        dataKey="holders" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="platforms">
                  <div className="flex h-[200px]">
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie
                          data={streamingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {streamingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="w-[40%] flex flex-col justify-center space-y-2">
                      {streamingData.map((platform, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <div className="text-white/80 text-sm">{platform.name}: {platform.value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}