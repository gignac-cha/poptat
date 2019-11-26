# -*- coding: utf-8 -*-

import datetime
import json
import gzip

import boto3

import requests

def lambda_handler(event, context):
  now = datetime.datetime.utcnow()
  year, month, day = now.year, now.month, now.day
  s3 = boto3.client("s3")
  buses = json.loads(gzip.decompress(s3.get_object(Bucket="poptat", Key="static/bus-path.json.gz")["Body"].read()))
  for bus in buses:
    url = f'https://bus.kakao.com/bus/{bus}/path'
    key = f'bus/path/{bus}/dt={year}.{month}.{day}/{now.isoformat()}.json.gz'
    body = gzip.compress(requests.get(url).content)
    s3.put_object(Bucket="poptat", Key=key, Body=body)
  return { "statusCode": 200 }

