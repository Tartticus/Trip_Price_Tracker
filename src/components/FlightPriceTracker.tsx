import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plane } from 'lucide-react';

interface FlightPrice {
  airline: string;
  price: number;
  departure: string;
  arrival: string;
  date: string;
}

interface Props {
  from: string;
  to: string;
  date: string;
}

export function FlightPriceTracker({ from, to, date }: Props) {
  const [prices, setPrices] = useState<FlightPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-prices?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch flight prices');
        }

        const data = await response.json();
        setPrices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [from, to, date]);

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg p-6 shadow-md">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Plane className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Flight Prices</h3>
          </div>
          <span className="text-sm text-blue-100">
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="mt-1 text-sm text-blue-100">
          {from} → {to}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {prices.map((price, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{price.airline}</p>
                <p className="text-sm text-gray-500">Direct Flight</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  ${price.price}
                </p>
                <p className="text-sm text-gray-500">Round Trip</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}