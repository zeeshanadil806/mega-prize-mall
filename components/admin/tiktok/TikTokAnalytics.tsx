"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TikTokEventStats {
  total_events: number;
  matched_events: number;
  match_rate: number;
  last_24h: number;
  top_events: Array<{
    event_name: string;
    count: number;
    match_rate: number;
  }>;
}

export function TikTokAnalytics() {
  const [stats, setStats] = useState<TikTokEventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/tiktok/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to load TikTok stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <div>Loading TikTok analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>TikTok Pixel Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold">{stats?.total_events || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Match Rate</p>
              <p className="text-2xl font-bold">
                {stats?.match_rate ? `${(stats.match_rate * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Last 24h</p>
              <p className="text-2xl font-bold">{stats?.last_24h || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Match Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.top_events.map((event) => (
                <TableRow key={event.event_name}>
                  <TableCell className="font-medium">{event.event_name}</TableCell>
                  <TableCell>{event.count}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>{(event.match_rate * 100).toFixed(1)}%</span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${event.match_rate * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}