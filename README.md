# Foko Chat API

By Daniel Adigun (Project Interview - Foko Retail).

Working deployment is available here : https://zealous-clarke-97d9c3.netlify.com/

## About

A simple chat service. Code repo contains two folders. 
1. client - contains front end client code built with angular
2. server - server directory contains NodeJs server code developed with socket.io and ExpressJs
3. Database - MongoDb

## Features

1.  Authentication - users are authenticated via email and password. 
2.  Two authenticated users can chat but connections are limited to just two persons
3.  Users can chat in a group chat but connections are limited to just 10

## How to use

1.  Open two terminal windows
2.  CD.. into 'server' and run 'node server' or 'nodemon server' on 1st terminal
3.  CD.. into 'client' and run 'ng serve -o' on 2nd terminal
4.  Point your browser to http://localhost:3450
5.  Create an account and start chatting.

##  Live Deployments

1. Server endpoint is available on: https://foko-server.herokuapp.com/ and is hosted on heroku cloud
2. Client chat app is available on: https://zealous-clarke-97d9c3.netlify.com/ and is hosted on Netlify 
