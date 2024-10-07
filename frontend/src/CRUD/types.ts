export interface Portfolio {
  ticker: string;
  quantity: number;
  total_invested: number;
  current_price: number;
  price_bought: number;
  market_value: number;
  profit_loss: number;
}

export interface StockData {
  ticker: string;
  price: number | string;
  name: string;
  currency: string;
  price_data: { date: string; price: number }[];
}
