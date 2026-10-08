FROM python:3.14-slim

WORKDIR /app

COPY application/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY application/ .

EXPOSE 5000

CMD ["python", "app.py"]
