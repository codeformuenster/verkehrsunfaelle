FROM python:3.7

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt \
  && pip install --no-cache-dir kinto-wizard==4.0.1
