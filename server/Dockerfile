FROM golang:alpine

RUN apk add --no-cache git

WORKDIR /go/src


RUN mkdir -p /go/src

RUN mkdir /go/src/common
RUN mkdir /go/src/models
RUN mkdir /go/src/controllers

ADD go.mod /go/src
ADD go.sum /go/src
ADD main.go /go/src
ADD ./common /go/src/common
ADD ./models /go/src/models
ADD ./controllers /go/src/controllers

RUN go build -o main .

CMD ["/go/src/main"]
