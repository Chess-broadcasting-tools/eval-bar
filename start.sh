#!/bin/bash
gunicorn -w 4 chess_api:app -b 0.0.0.0:5000
