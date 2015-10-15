FROM node:4
RUN git clone https://github.com/jsdelivr/api
RUN cd api && npm install
EXPOSE 8089
CMD ["/usr/bin/npm start"]
