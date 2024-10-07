import axios from 'axios';
import { Portfolio, StockData } from './types';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const searchTickers = async (query: string) => {
  const response = await api.get('/search', { params: { ticker: query } });
  return response.data as {
    name: string;
    symbol: string;
  }[];
};

export const queryStock = async (tickerSymbol: string) => {
    
  const response = await api.get('/query', { params: { ticker: tickerSymbol } });

  if (response.data.length === 0) {
    return null;
  }

  const priceData = response.data.price_data.map((item: { date: string; price: number }) => {
    return {
      date: new Date(item.date),
      price: item.price
    };
  });

  return {
    ...response.data,
    price_data: priceData
  } as StockData;
};

export const buyStock = async (tickerSymbol: string, quantity: number) => {
  const response = await api.post('/buy', { ticker: tickerSymbol, quantity });
  return response.data;
};

export const sellStock = async (tickerSymbol: string, quantity: number) => {
  const response = await api.post('/sell', { ticker: tickerSymbol, quantity });
  return response.data;
};

export const viewPortfolio = async () => {
  const response = await api.get('/portfolio');
  return response.data as Portfolio[];
};
