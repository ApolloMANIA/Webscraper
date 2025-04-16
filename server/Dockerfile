FROM python:3.10

WORKDIR /app
COPY requirements.txt /app/requirements.txt
COPY package*.json /app/package.json
COPY . /app

RUN apt-get update && apt-get install -y wget unzip curl && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y ./google-chrome-stable_current_amd64.deb && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm google-chrome-stable_current_amd64.deb

RUN node - v && \
    npm -v 

RUN npm install

RUN pip3 install --no-cache-dir -r /app/requirements.txt

EXPOSE 3000

CMD ["node", "index.js"]
