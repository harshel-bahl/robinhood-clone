import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/shadcn/ui/button';
import { queryStock } from '../CRUD/requests';
import { Input } from '../components/catalyst/input';
import { StockData } from '../CRUD/types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/shadcn/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/shadcn/ui/card';
import { Label } from '../components/shadcn/ui/label';
import { buyStock, sellStock, viewPortfolio } from '../CRUD/requests';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/hooks/use-toast';

const Trade = () => {

    const [query, setQuery] = useState('');
    const [tickerData, setTickerData] = useState<StockData | null>(null);
    const [isSmallScreen, setIsSmallScreen] = useState(window.matchMedia("(max-width: 768px)").matches);
    const [quantity, setQuantity] = useState(0);
    const [noTickerFound, setNoTickerFound] = useState(false);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: portfolioData, error } = useQuery({
        queryKey: ['portfolioData'],
        queryFn: viewPortfolio,
        staleTime: 1000 * 60 * 5,
    });

    const currentQuantity = useMemo(() => {
        if (tickerData && portfolioData) {
            return portfolioData.find(data => data.ticker === tickerData.ticker)?.quantity || 0;
        }
        return 0;
    }, [tickerData, portfolioData]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handler = () => setIsSmallScreen(mediaQuery.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const handleQuerySubmit = async () => {
        try {
            const data = await queryStock(query);
            if (data) {
                setTickerData(data);
                setNoTickerFound(false);
            } else {
                setTickerData(null);
                setNoTickerFound(true);
            }
        } catch (error) {
            console.error('Error querying stock:', error);
        }
    };

    const handleBuy = async () => {
        if (tickerData && quantity > 0) {
            try {
                const result = await buyStock(tickerData.ticker, quantity);
                toast({
                    title: 'Transaction Successful',
                    description: `Buy successful! Total cost: ${result.totalCost}`,
                });
                queryClient.invalidateQueries({ queryKey: ['portfolioData'] });
            } catch (error) {
                console.error('Error buying stock:', error);
                toast({
                    title: 'Transaction Failed',
                    description: 'Failed to buy stock.',
                });
            }
        } else {
            toast({
                title: 'Invalid Quantity',
                description: 'Please enter a valid quantity.',
            });
        }
    };

    const handleSell = async () => {
        if (tickerData && quantity > 0 && quantity <= currentQuantity) {
            try {
                const result = await sellStock(tickerData.ticker, quantity);
                toast({
                    title: 'Transaction Successful',
                    description: `Sell successful! Total sold: ${result.totalRevenue}`,
                });
                queryClient.invalidateQueries({ queryKey: ['portfolioData'] });
            } catch (error) {
                console.error('Error selling stock:', error);
                toast({
                    title: 'Transaction Failed',
                    description: 'Failed to sell stock.',
                });
            }
        } else {
            toast({
                title: 'Invalid Quantity',
                description: 'Please enter a valid quantity.',
            });
        }
    };

    const handleSellAll = () => {
        setQuantity(currentQuantity);
    };

    return (
        <div className="grow flex flex-col items-center justify-center gap-5">

            <div className='w-full flex flex-col gap-10 justify-center items-center bg-background rounded-lg px-8 py-5'>
                <h1 className='text-4xl font-bold mr-auto'>Trade</h1>

                <div className='w-full flex justify-center gap-5'>
                    <Input
                        className='max-w-[600px]'
                        type='text'
                        placeholder='Enter a ticker symbol'
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleQuerySubmit();
                            }
                        }}
                    />
                    <Button onClick={handleQuerySubmit}>Search</Button>
                </div>

                {noTickerFound && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Ticker Found for {query}</CardTitle>
                            <CardDescription>
                                Please enter a valid ticker symbol.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>

            {tickerData && (
                <>
                    <div className='w-full flex flex-col md:flex-row gap-12 justify-center items-center bg-background rounded-lg sm:px-8 sm:py-5 px-2 py-2'>

                        <ResponsiveContainer className='grow' width={isSmallScreen ? 400 : 600} height={400}>
                            <LineChart
                                className=''
                                data={tickerData.price_data.map(data => ({
                                    date: data.date,
                                    price: data.price
                                }))}
                                margin={{ top: 0, left: 5, right: 5, bottom: 0 }}
                                style={{ transform: 'translate(-20px, 20px)' }}
                            >
                                <Line type="monotone" dataKey="price" stroke="#8884d8" />
                                <XAxis
                                    dataKey="date"
                                    fontSize={11}
                                    height={60}
                                    tickFormatter={(tick) => new Date(tick).getDate().toString()}
                                    interval={2}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    fontSize={11}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#f0f0f0', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', fontSize: '10px' }}
                                    itemStyle={{ color: '#333' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    formatter={(value) => {
                                        const numValue = Number(value);
                                        return isNaN(numValue) ? value : numValue.toFixed(2);
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        <Tabs defaultValue="buy" className="w-[400px] grow">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="buy">Buy</TabsTrigger>
                                <TabsTrigger value="sell">Sell</TabsTrigger>
                            </TabsList>
                            <TabsContent value="buy">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Buy</CardTitle>
                                        <CardDescription>
                                            Buy shares of {tickerData.ticker} at the current price of ${tickerData.price}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex flex-col items-center gap-5">
                                        <div className="w-full space-y-1">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input id="quantity" type="number" min={1} onChange={(e) => setQuantity(Number(e.target.value))} />
                                        </div>

                                        <div className='w-full flex justify-start items-center'>
                                            <p className='text-sm'><strong>Current Quantity: {currentQuantity} shares</strong></p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className='flex justify-center'>
                                        <Button onClick={handleBuy}>Buy</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                            <TabsContent value="sell">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sell</CardTitle>
                                        <CardDescription>
                                            Sell shares of {tickerData.ticker} at the current price of ${tickerData.price}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex flex-col items-center gap-5">
                                        <div className="w-full space-y-1">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input 
                                            id="quantity" 
                                            type="number" 
                                            min="1" 
                                            max={currentQuantity} 
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value, 10);
                                                setQuantity(isNaN(value) ? 0 : value); 
                                            }} 
                                            />
                                        </div>

                                        <div className='w-full flex justify-between items-center'>
                                            <p className='text-sm'><strong>Current Quantity: {currentQuantity} shares</strong></p>
                                            <Button onClick={handleSellAll}>Sell All</Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className='flex justify-center'>
                                        <Button onClick={handleSell}>Sell</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </>
            )}
        </div>
    );
};

export default Trade;