#!/bin/bash

IMAGE_NAME="node_dev_image_bo"
CONTAINER_NAME="shop_bo_bo"
LOCAL_DIR=".."
VOLUME_DIR="volume_node_modules"
PORT="5174"

if [ ! -d "$LOCAL_DIR" ]; then
    echo "Errore: La directory del progetto \"$LOCAL_DIR\" non esiste."
    read -p "Premi invio per uscire..." dummy
    exit 1
fi

if [ ! -d "$VOLUME_DIR" ]; then
    echo "Creazione della directory per il volume persistente..."
    mkdir "$VOLUME_DIR"
fi

echo "Costruzione dell'immagine Docker..."
docker build -t "$IMAGE_NAME" .
if [ $? -ne 0 ]; then
    echo "Errore durante la costruzione dell'immagine Docker."
    read -p "Premi invio per uscire..." dummy
    exit 1
fi

echo "Avvio del container Docker..."
docker run --rm -it \
  --name "$CONTAINER_NAME" \
  -p "$PORT":5173 \
  -v "$(pwd)/$LOCAL_DIR:/workspace" \
  -v "$(pwd)/$VOLUME_DIR:/workspace/node_modules" \
  "$IMAGE_NAME" bash -c "npm install -g npm@latest vite@latest vue@latest && cd /workspace && npm install && npm install vite@latest --save-dev && npm run dev"
if [ $? -ne 0 ]; then
    echo "Errore durante l'avvio del container Docker."
    read -p "Premi invio per uscire..." dummy
    exit 1
fi

read -p "Premi invio per terminare..." dummy
