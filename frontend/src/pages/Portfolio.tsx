import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { viewPortfolio } from '../CRUD/requests';
import { Portfolio } from '../CRUD/types';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/shadcn/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/shadcn/ui/card';
import { Button } from '../components/shadcn/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ErrorBoundary from '../components/ErrorBoundary';

const PortfolioPage = () => {

    // Router
    const navigate = useNavigate();

    // Queries
    const { data: portfolioData, error } = useQuery({
        queryKey: ['portfolioData'],
        queryFn: viewPortfolio,
        refetchInterval: 1000 * 5,
    });

    // Memos
    const chartData = useMemo(() => {
        if (!portfolioData) return [];
        return portfolioData.map((portfolio) => ({
            name: portfolio.ticker,
            value: portfolio.market_value,
        }));
    }, [portfolioData]);
    const totalValue = useMemo(() => portfolioData?.reduce((total, portfolio) => total + portfolio.market_value, 0) || 0, [portfolioData]);
    const totalInvested = useMemo(() => portfolioData?.reduce((total, portfolio) => total + portfolio.total_invested, 0) || 0, [portfolioData]);
    const growth = useMemo(() => totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0, [totalValue, totalInvested]);

    // Constants

    if (!portfolioData || !chartData) return null;

    return (
        <div className="flex flex-col items-center justify-center gap-5">

            <div className='w-full flex items-center justify-between gap-5 bg-background rounded-lg px-8 py-5'>
                <div className='grow h-full flex items-start justify-between '>
                    <h1 className='text-4xl font-bold'>Portfolio</h1>
                    <div className='flex items-end gap-4'>
                        <h2 style={{ color: growth > 0 ? '#33cc33' : '#ff3333' }} className='text-5xl font-bold'>${totalValue.toFixed(2)}</h2>
                        <h2 style={{ color: growth > 0 ? '#33cc33' : '#ff3333' }} className='text-lg'>{growth.toFixed(2)}%</h2>
                    </div>
                </div>
            </div>

            {portfolioData.length > 0 && (
                <div className="w-full flex flex-col justify-center items-center bg-background rounded-lg px-8 py-5">
                    <h1 className='text-2xl font-bold mr-auto'>Portfolio breakdown</h1>
                    <PieChart width={350} height={350}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 50%)`} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => `$${Math.round(value)}`} 
                            contentStyle={{ borderRadius: '10px', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', border: 'none' }} 
                        />
                    </PieChart>
                </div>
            )}

            <div className="w-full flex flex-col justify-center items-center bg-background rounded-lg px-8 py-5 gap-10">
                <h1 className='text-2xl font-bold mr-auto'>Holdings</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticker</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total Invested</TableHead>
                            <TableHead>Price Bought</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>Market Value</TableHead>
                            <TableHead>Profit/Loss</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {portfolioData.map((portfolio, index) => (
                            <TableRow key={index}>
                                <TableCell>{portfolio.ticker}</TableCell>
                                <TableCell>{portfolio.quantity}</TableCell>
                                <TableCell>${portfolio.total_invested.toFixed(2)}</TableCell>
                                <TableCell>${portfolio.price_bought.toFixed(2)}</TableCell>
                                <TableCell>${portfolio.current_price.toFixed(2)}</TableCell>
                                <TableCell>${portfolio.market_value.toFixed(2)}</TableCell>
                                <TableCell style={{ color: portfolio.profit_loss > 0 ? '#33cc33' : '#ff3333' }}>${portfolio.profit_loss.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {portfolioData.length == 0 && <Card className='mt-10'>
                    <CardHeader>
                        <CardTitle>Looks like your portfolio is empty!</CardTitle>
                        <CardDescription>Purchase some stocks for them to show up here</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col items-center justify-center'>
                        <Button onClick={() => {
                            navigate('/trade');
                        }}>Let's trade</Button>
                    </CardContent>
                </Card>}
            </div>
        </div>
    );
};

export default PortfolioPage;

