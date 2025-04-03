import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightPrice {
  airline: string;
  price: number;
  departure: string;
  arrival: string;
  date: string;
}

// Mock data for demonstration - in production, this would connect to real airline APIs
const getMockFlightPrices = (from: string, to: string, date: string): FlightPrice[] => {
  const airlines = ['United', 'American Airlines', 'Delta', 'Southwest'];
  const basePrice = 300;
  
  return airlines.map(airline => ({
    airline,
    price: basePrice + Math.floor(Math.random() * 200),
    departure: from,
    arrival: to,
    date,
  }));
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const date = url.searchParams.get('date');

    if (!from || !to || !date) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prices = getMockFlightPrices(from, to, date);

    return new Response(
      JSON.stringify(prices),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});