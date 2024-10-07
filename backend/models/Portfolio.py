from db import db
from datetime import datetime

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_bought = db.Column(db.Float, nullable=False)
    date_bought = db.Column(db.DateTime, default=datetime.utcnow)