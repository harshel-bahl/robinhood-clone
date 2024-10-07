from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from db import db
import yfinance as yf
import models as md
from dotenv import load_dotenv
import os 
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/query', methods=['GET'])
def query_stock():
    ticker_symbol = request.args.get('ticker')
    if not ticker_symbol:
        return jsonify({'error': 'No ticker symbol provided'}), 400
    try:
        stock = yf.Ticker(ticker_symbol)
        info = stock.info

        if info is None or info.get('currentPrice') is None or info.get('longName') is None or info.get('currency') is None:
            return jsonify([]), 200
        
        history = stock.history(period='1mo')
        if not history.empty:
            price_data = [
                {
                    'date': date,
                    'price': price
                }
                for date, price in zip(history.index, history['Close'])
            ]
        else:
            return jsonify([]), 200

        return jsonify({
            'ticker': ticker_symbol.upper(),
            'price': info.get('currentPrice'),
            'name': info.get('longName'),
            'currency': info.get('currency'),
            'price_data': price_data,
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/buy', methods=['POST'])
def buy_stock():
    data = request.get_json()
    ticker_symbol = data.get('ticker')
    quantity = data.get('quantity')

    if not ticker_symbol or not quantity:
        return jsonify({'error': 'Ticker symbol and quantity are required'}), 400
    
    try:
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        price = info['currentPrice']
        total_cost = price * quantity
        new_purchase = md.Portfolio(
            ticker=ticker_symbol.upper(),
            quantity=quantity,
            price_bought=price
        )
        db.session.add(new_purchase)
        db.session.commit()
        return jsonify({'message': f'Bought {quantity} shares of {ticker_symbol.upper()} at ${price} each', 'totalCost': total_cost})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/sell', methods=['POST'])
def sell_stock():
    data = request.get_json()
    ticker_symbol = data.get('ticker')
    quantity = data.get('quantity')

    if not ticker_symbol or not quantity:
        return jsonify({'error': 'Ticker symbol and quantity are required'}), 400
    
    try:
        holdings = md.Portfolio.query.filter_by(ticker=ticker_symbol.upper()).all()
        total_quantity = sum([h.quantity for h in holdings])
        if total_quantity < quantity:
            return jsonify({'error': 'Not enough shares to sell'}), 400
        
        stock = yf.Ticker(ticker_symbol)
        current_price = stock.info['currentPrice']
        total_revenue = quantity * current_price
        
        remaining = quantity
        for holding in holdings:
            if holding.quantity <= remaining:
                remaining -= holding.quantity
                db.session.delete(holding)
            else:
                holding.quantity -= remaining
                remaining = 0
            if remaining == 0:
                break
        db.session.commit()
        return jsonify({'message': f'Sold {quantity} shares of {ticker_symbol.upper()}', 'totalRevenue': total_revenue})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/portfolio', methods=['GET'])
def view_portfolio():
    try:
        holdings = md.Portfolio.query.all()

        portfolio = []
        for holding in holdings:
            existing = next((item for item in portfolio if item['ticker'] == holding.ticker), None)
            if existing:
                existing['quantity'] += holding.quantity
                existing['total_invested'] += holding.quantity * holding.price_bought
            else:
                portfolio.append({
                    'ticker': holding.ticker,
                    'quantity': holding.quantity,
                    'price_bought': holding.price_bought,
                    'total_invested': holding.quantity * holding.price_bought
                })
        
        for item in portfolio:
            stock = yf.Ticker(item['ticker'])
            info = stock.info
            current_price = info['currentPrice']
            item['current_price'] = current_price
            item['market_value'] = item['quantity'] * current_price
            item['profit_loss'] = item['market_value'] - item['total_invested']
        return jsonify(portfolio)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':

    with app.app_context():
        db.create_all()

    app.run(host='127.0.0.1', port=3001,debug=True)
