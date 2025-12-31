'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Trophy,
  Users,
  Sparkles,
  RotateCw,
  ArrowLeft,
  CheckCircle,
  Gift,
//   DollarSign,
//   Calendar,
//   Clock,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import { formatCurrency } from '@/lib/bargain-utils';

interface DrawEntry {
  _id: string;
  entryNumber: number;
  customerName: string;
  orderId: string;
  orderAmount: number;
}

interface LuckyDraw {
  _id: string;
  title: string;
  description: string;
  prizeName: string;
  prizeDescription: string;
  prizeCategory: string;
  totalEntries: number;
  eligibleUserCount: number;
}

interface SpinWheelClientProps {
  draw: LuckyDraw;
  entries: DrawEntry[];
  adminId: string;
}

// Color palette for wheel segments
const WHEEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F',
  '#FF9A76', '#7BDCB5', '#FAD2E1', '#B5EAD7', '#C7CEEA', '#FFDAC1',
  '#E2F0CB', '#FFB7B2', '#FFD3B6', '#FFAAA5', '#FF8B94', '#A8E6CF',
  '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'
];

export function SpinWheelClient({ draw, entries }: SpinWheelClientProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<DrawEntry | null>(null);
  const [spinAngle, setSpinAngle] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<DrawEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const wheelRadius = 300;
  const centerX = 350;
  const centerY = 350;

  // Initialize wheel on mount
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalEntries = entries.length;
    const anglePerSegment = (2 * Math.PI) / totalEntries;

    // Draw wheel segments
    for (let i = 0; i < totalEntries; i++) {
      const startAngle = i * anglePerSegment + spinAngle;
      const endAngle = (i + 1) * anglePerSegment + spinAngle;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();
      
      // Fill with color
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw entry number in segment
      const midAngle = startAngle + anglePerSegment / 2;
      const textRadius = wheelRadius * 0.7;
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`#${entries[i].entryNumber}`, 0, 0);
      ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw center icon
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', centerX, centerY);

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + wheelRadius + 20, centerY);
    ctx.lineTo(centerX + wheelRadius + 40, centerY - 10);
    ctx.lineTo(centerX + wheelRadius + 40, centerY + 10);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
  };
  useEffect(() => {
    if (canvasRef.current && entries.length > 0) {
      drawWheel();
    }
  }, [entries]);


  const spinWheel = () => {
    if (isSpinning || entries.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setError(null);

    // Random spin duration (3-6 seconds)
    const spinDuration = 3000 + Math.random() * 3000;
    // Random number of full rotations (5-10)
    const fullRotations = 5 + Math.random() * 5;
    // Random winning segment
    const winningSegment = Math.floor(Math.random() * entries.length);
    
    setSelectedSegment(winningSegment);

    // Total spin angle (full rotations + offset to land on winning segment)
    const totalAngle = fullRotations * 2 * Math.PI;
    const segmentAngle = (2 * Math.PI) / entries.length;
    const offset = winningSegment * segmentAngle;
    const finalAngle = totalAngle + offset;

    // Animation
    const startTime = Date.now();
    const startAngle = spinAngle;

    const animateSpin = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing function for smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);

      const currentAngle = startAngle + (finalAngle * easedProgress);
      setSpinAngle(currentAngle % (2 * Math.PI));

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin complete
        setIsSpinning(false);
        const winningEntry = entries[winningSegment];
        setWinner(winningEntry);
        setSpinHistory(prev => [winningEntry, ...prev.slice(0, 4)]);
        
        // Redraw wheel with final position
        drawWheel();
      }
    };

    animateSpin();
  };

  const selectWinner = async () => {
    if (!winner) return;

    try {
      const response = await fetch(`/api/admin/lucky-draw/${draw._id}/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success message and redirect
        setTimeout(() => {
          router.push(`/admin/lucky-draw/${draw._id}`);
          router.refresh();
        }, 2000);
      } else {
        setError(data.error || 'Failed to select winner');
      }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

      setError(errorMessage || 'Network error');
    }
  };

  const getEntryDetails = (entry: DrawEntry) => {
    return {
      name: entry.customerName,
      entryNumber: entry.entryNumber,
      orderAmount: formatCurrency(entry.orderAmount),
      orderId: entry.orderId.slice(-8).toUpperCase(),
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href={`/admin/lucky-draw/${draw._id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Draw
            </a>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Spin Wheel</h1>
              <p className="text-muted-foreground">
                Select winner for: <span className="font-semibold">{draw.title}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-1">
            <Users className="h-4 w-4 mr-2" />
            {entries.length} Entries
          </Badge>
        </div>
      </div>

      {/* Alert if no entries */}
      {entries.length === 0 && (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Entries Available</AlertTitle>
          <AlertDescription>
            There are no active entries for this draw. The draw needs qualifying orders first.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Wheel & Controls */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCw className="h-5 w-5" />
                Spin Wheel
              </CardTitle>
              <CardDescription>
                Click spin to randomly select a winner from all entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Wheel Container */}
              <div className="relative">
                <div className="overflow-hidden rounded-xl bg-linear-to-br from-gray-50 to-gray-100 p-8 border-2 border-dashed border-gray-200">
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={700}
                    className="w-full h-auto max-h-[600px]"
                  />
                </div>
                
                {/* Spin Button */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <Button
                    size="lg"
                    className={`h-14 w-14 rounded-full ${
                      isSpinning 
                        ? 'bg-linear-to-r from-yellow-500 to-orange-500 animate-pulse' 
                        : 'bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    }`}
                    onClick={spinWheel}
                    disabled={isSpinning || entries.length === 0}
                  >
                    {isSpinning ? (
                      <RotateCw className="h-6 w-6 animate-spin" />
                    ) : (
                      <Sparkles className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={spinWheel}
                  disabled={isSpinning || entries.length === 0}
                  className="h-14"
                >
                  <RotateCw className="h-5 w-5 mr-2" />
                  {isSpinning ? 'Spinning...' : 'Spin Wheel'}
                </Button>
                
                <Button
                  size="lg"
                  onClick={selectWinner}
                  disabled={!winner || isSpinning}
                  className="h-14 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm Winner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info & Winner Details */}
        <div className="space-y-6">
          {/* Draw Prize Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Prize Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-linear-to-r from-primary/5 to-primary/10 rounded-lg">
                <h3 className="text-xl font-bold text-primary">{draw.prizeName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{draw.prizeDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold mt-1">{draw.totalEntries}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold mt-1">{draw.eligibleUserCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winner Display */}
          {winner && (
            <Card className="border-green-200 bg-linear-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <PartyPopper className="h-5 w-5" />
                  Winner Selected!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-green-800">
                    {getEntryDetails(winner).name}
                  </h3>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline">Entry #{getEntryDetails(winner).entryNumber}</Badge>
                      <Badge variant="outline" className="bg-blue-50">
                        Order: {getEntryDetails(winner).orderId}
                      </Badge>
                    </div>
                    
                    <p className="text-lg font-semibold">
                      Order Amount: {getEntryDetails(winner).orderAmount}
                    </p>
                  </div>
                </div>

                <Separator />
                
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Click &quot;Confirm Winner&quot; to officially declare this winner. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Recent Spins History */}
          {spinHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Spins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spinHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{entry.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          Entry #{entry.entryNumber} • {formatCurrency(entry.orderAmount)}
                        </p>
                      </div>
                      <Badge variant="outline">{index === 0 ? 'Latest' : `#${index + 1}`}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p className="text-sm">Click &quot;Spin Wheel&quot; to randomize selection</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p className="text-sm">Wheel will spin and land on a random entry</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <p className="text-sm">Review selected winner details</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <p className="text-sm">Click &quot;Confirm Winner&quot; to finalize</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}