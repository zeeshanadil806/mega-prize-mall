'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Gift,
  Ticket,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  DollarSign,
  Package,
//   TrendingUp,
  History,
  Star,
  Car,
  Smartphone,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency } from '@/lib/bargain-utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Draw {
  id: string;
  title: string;
  description: string;
  prizeName: string;
  prizeImage?: string;
  prizeCategory: string;
  totalEntries: number;
  eligibleUserCount: number;
  drawDate?: string;
  daysRemaining?: number | null;
}

interface UserEntry {
  id: string;
  entryNumber: number;
  drawTitle: string;
  prizeName: string;
  status: string;
  orderAmount: number;
  orderDate: string;
  createdAt: string;
  drawStatus: string;
  isWinner: boolean;
}

interface UserEntriesData {
  totalEntries: number;
  activeEntries: number;
  wonDraws: number;
  entries: UserEntry[];
}

interface CompletedDraw {
  _id: string;
  title: string;
  prizeName: string;
  prizeCategory: string;
  winnerName?: string;
  winnerEmail?: string;
  resultDate?: Date;
  totalEntries: number;
}

interface EligibleOrder {
  _id: string;
  grandTotal: number;
  createdAt: string;
  items: Array<{ productName: string }>;
}

interface LuckyDrawDashboardClientProps {
  userEntries: UserEntriesData;
  activeDraws: Draw[];
  completedDraws: CompletedDraw[];
  eligibleOrders: EligibleOrder[];
  userId: string;
}

const prizeCategoryIcons: Record<string, React.ReactNode> = {
  vehicle: <Car className="h-5 w-5" />,
  electronics: <Smartphone className="h-5 w-5" />,
  cash: <DollarSign className="h-5 w-5" />,
  voucher: <ShoppingBag className="h-5 w-5" />,
  other: <Gift className="h-5 w-5" />,
};

const prizeCategoryColors: Record<string, string> = {
  vehicle: 'bg-red-100 text-red-800',
  electronics: 'bg-blue-100 text-blue-800',
  cash: 'bg-green-100 text-green-800',
  voucher: 'bg-purple-100 text-purple-800',
  other: 'bg-amber-100 text-amber-800',
};

export function LuckyDrawDashboardClient({
  userEntries,
  activeDraws,
  completedDraws,
  eligibleOrders,
//   userId,
}: LuckyDrawDashboardClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const handleRefresh = () => {
    setIsLoading(true);
    router.refresh();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Lucky Draw</h1>
          </div>
          <p className="text-muted-foreground">
            Win amazing prizes with every purchase over Rs 3000!
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <History className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/products">
              Shop Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-linear-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Entries</p>
                <p className="text-2xl font-bold mt-2">{userEntries.activeEntries}</p>
                <p className="text-sm text-muted-foreground">
                  {userEntries.totalEntries} total entries
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Draws</p>
                <p className="text-2xl font-bold mt-2">{activeDraws.length}</p>
                <p className="text-sm text-muted-foreground">
                  Join to win amazing prizes
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draws Won</p>
                <p className="text-2xl font-bold mt-2">{userEntries.wonDraws}</p>
                <p className="text-sm text-muted-foreground">
                  Congratulations!
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eligible Orders</p>
                <p className="text-2xl font-bold mt-2">{eligibleOrders.length}</p>
                <p className="text-sm text-muted-foreground">
                  Ready for entry creation
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Active Draws
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            My Entries
          </TabsTrigger>
          <TabsTrigger value="winners" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Past Winners
          </TabsTrigger>
        </TabsList>

        {/* Active Draws Tab */}
        <TabsContent value="active" className="space-y-6">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : activeDraws.length === 0 ? (
            // Empty State
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Draws</h3>
                <p className="text-muted-foreground mb-6">
                  Check back later for new lucky draw opportunities!
                </p>
              </CardContent>
            </Card>
          ) : (
            // Active Draws List
            activeDraws.map((draw) => (
              <Card key={draw.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={prizeCategoryColors[draw.prizeCategory]}>
                          <span className="flex items-center gap-1">
                            {prizeCategoryIcons[draw.prizeCategory]}
                            {draw.prizeCategory.charAt(0).toUpperCase() + draw.prizeCategory.slice(1)}
                          </span>
                        </Badge>
                        {draw.daysRemaining && draw.daysRemaining > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {draw.daysRemaining} days left
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{draw.title}</CardTitle>
                      <CardDescription>{draw.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="h-12 w-12 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Prize Info */}
                    <div className="flex items-center justify-between p-4 bg-linear-to-r from-primary/5 to-primary/10 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Grand Prize</p>
                        <p className="text-lg font-bold">{draw.prizeName}</p>
                      </div>
                      <Badge className="text-sm px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Amazing Prize!
                      </Badge>
                    </div>

                    {/* Draw Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{draw.totalEntries}</p>
                        <p className="text-sm text-muted-foreground">Total Entries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{draw.eligibleUserCount}</p>
                        <p className="text-sm text-muted-foreground">Participants</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {draw.totalEntries > 0 
                            ? ((userEntries.activeEntries / draw.totalEntries) * 100).toFixed(1)
                            : '0'
                          }%
                        </p>
                        <p className="text-sm text-muted-foreground">Your Chance</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">1</p>
                        <p className="text-sm text-muted-foreground">Winner</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Draw Progress</span>
                        <span>{draw.totalEntries} entries</span>
                      </div>
                      <Progress value={Math.min((draw.totalEntries / 1000) * 100, 100)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {draw.drawDate 
                      ? `Draw on ${new Date(draw.drawDate).toLocaleDateString()}`
                      : 'Draw date to be announced'
                    }
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/lucky-draw/${draw.id}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        {/* My Entries Tab */}
        <TabsContent value="entries" className="space-y-6">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : userEntries.entries.length === 0 ? (
            // Empty State
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Entries Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Make purchases over Rs 3000 to get automatic lucky draw entries!
                </p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Entries List
            <div className="space-y-4">
              {userEntries.entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            entry.isWinner 
                              ? 'bg-linear-to-r from-yellow-400 to-orange-500 text-white'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {entry.isWinner ? (
                              <Trophy className="h-4 w-4" />
                            ) : (
                              <Ticket className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{entry.drawTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              Entry #{entry.entryNumber} • {getDaysAgo(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Order: {formatCurrency(entry.orderAmount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(entry.orderDate)}
                          </span>
                          <Badge variant={entry.isWinner ? "default" : "outline"}>
                            {entry.isWinner ? 'WINNER 🎉' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Draw Status</p>
                        <p className={`text-lg font-bold ${
                          entry.drawStatus === 'completed' 
                            ? 'text-green-600' 
                            : 'text-blue-600'
                        }`}>
                          {entry.drawStatus === 'completed' 
                            ? (entry.isWinner ? 'YOU WON!' : 'Completed')
                            : 'Active'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Winners Tab */}
        <TabsContent value="winners" className="space-y-6">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : completedDraws.length === 0 ? (
            // Empty State
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Winners</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first winner! Participate in active draws.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Winners List
            completedDraws.map((draw) => (
              <Card key={draw._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{draw.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Badge className={prizeCategoryColors[draw.prizeCategory]}>
                          <span className="flex items-center gap-1">
                            {prizeCategoryIcons[draw.prizeCategory]}
                            {draw.prizeCategory.charAt(0).toUpperCase() + draw.prizeCategory.slice(1)}
                          </span>
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {draw.totalEntries} entries
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="h-10 w-10 rounded-full bg-linear-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Winner Announcement */}
                    <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CONGRATULATIONS TO</p>
                          <p className="text-lg font-bold text-green-700">
                            {draw.winnerName || 'Anonymous Winner'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Won: <span className="font-semibold">{draw.prizeName}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Draw Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Draw Date</p>
                        <p className="text-muted-foreground">
                          {draw.resultDate 
                            ? new Date(draw.resultDate).toLocaleDateString('en-PK', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Date not available'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Total Participants</p>
                        <p className="text-muted-foreground">{draw.totalEntries} people</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            How Lucky Draw Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold">Shop & Qualify</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Make purchases worth Rs 3000 or more
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold">Get Automatic Entry</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Auto-entry when order is delivered
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold">Wait for Draw</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Admin announces draw date
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-yellow-600">4</span>
              </div>
              <h4 className="font-semibold">Win Amazing Prizes</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Single winner selected per draw
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="bg-linear-to-r from-primary/5 to-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Important Information</h4>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Only orders with status &quot;Delivered&quot; qualify</li>
                  <li>• Minimum order amount: Rs 3000 (after discounts)</li>
                  <li>• Each qualifying order gets 1 entry</li>
                  <li>• Draws are announced manually by admin</li>
                  <li>• Winners are selected randomly from all entries</li>
                  <li>• Winners will be notified via email</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}