from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class MaddeBasi(db.Model):
    __tablename__ = 'maddebasi'
    id = db.Column(db.Integer, primary_key=True)
    baslik = db.Column(db.String(100), unique=True, nullable=False)

    anlamlar = db.relationship('Anlam', backref='maddebasi', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<MaddeBasi {self.baslik}>"

class Anlam(db.Model):
    __tablename__ = 'anlam'
    id = db.Column(db.Integer, primary_key=True)
    maddebasi_id = db.Column(db.Integer, db.ForeignKey('maddebasi.id'), nullable=False)
    metin = db.Column(db.Text, nullable=False)

    kunyeler = db.relationship('Kunye', backref='anlam', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<Anlam {self.id}>"

class Kunye(db.Model):
    __tablename__ = 'kunye'
    id = db.Column(db.Integer, primary_key=True)
    anlam_id = db.Column(db.Integer, db.ForeignKey('anlam.id'), nullable=False)
    bilgi = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"<Kunye {self.bilgi}>"
