Kurulum Rehberi

1. Python yüklü değilse indirip kurun: https://www.python.org/
2. Proje klasörünü açın ve terminalde aşağıdaki komutları sırayla çalıştırın:

   python -m venv venv
   venv\Scripts\activate    (Linux/Mac: source venv/bin/activate)
   pip install flask flask_sqlalchemy

3. `app.py` dosyasını oluşturup aşağıdaki Flask kodunu ekleyin (ChatGPT'den alınacak).
4. Ardından:
   flask run

5. Uygulama http://127.0.0.1:5000 adresinde çalışır.
