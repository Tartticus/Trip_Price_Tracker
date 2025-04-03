import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  destination: string;
  trend: 'up' | 'down';
  percentage: number;
  currentPrice: number;
}

export function FlightTrendBox({ destination, trend, percentage, currentPrice }: Props) {
  const isUp = trend === 'up';
  const trendColor = isUp ? 'text-red-600' : 'text-green-600';
  const bgColor = isUp ? 'bg-red-50' : 'bg-green-50';
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className={`${bgColor} rounded-lg p-3 mt-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {percentage}% {isUp ? 'above' : 'below'} average
          </span>
        </div>
        <span className="text-sm font-bold">${currentPrice}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {isUp ? 'Prices are rising' : 'Good time to book'} for {destination}
      </p>
    </div>
  );
}