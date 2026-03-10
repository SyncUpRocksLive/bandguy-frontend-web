docker build -t ghcr.io/pjcast/syncup-react:latest -f builds/frontend/Dockerfile .
docker run -it --rm -p 8080:80 ghcr.io/pjcast/syncup-react:latest

docker build -t ghcr.io/pjcast/syncup-express-mock:latest -f builds/mock-backend/Dockerfile .
docker run -it --rm -p 9001:9001 ghcr.io/pjcast/syncup-express-mock:latest
