FROM ubuntu:latest
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies, Deno, and update yt-dlp
RUN apt-get update && apt-get install -y ffmpeg python3-pip curl unzip
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="/root/.deno/bin:$PATH"
RUN pip3 install -U yt-dlp --break-system-packages

# Install Node.js for the fake web server
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

WORKDIR /app
COPY server.js .
COPY cookies.txt .
RUN npm install express

EXPOSE 10000
CMD ["node", "server.js"]
