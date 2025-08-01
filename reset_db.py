from app import db, app

with app.app_context():
    print("Veritabanı tabloları siliniyor...")
    db.drop_all()
    print("Veritabanı tabloları oluşturuluyor...")
    db.create_all()
    print("Veritabanı sıfırlama tamamlandı.")
