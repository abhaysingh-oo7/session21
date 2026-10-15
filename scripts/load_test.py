#!/usr/bin/env python3
"""TaskBoard Load Generator Script
Used to generate HTTP traffic on the backend to test Horizontal Pod Autoscaler (HPA) and Grafana metrics.
"""

import argparse
import concurrent.futures
import time
import urllib.request
import urllib.error
import json
import sys

def make_request(url: str) -> tuple[int, float]:
    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TaskBoard-LoadTest/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception:
        status = 0
    duration = time.perf_counter() - start
    return status, duration

def main():
    parser = argparse.ArgumentParser(description="TaskBoard Load Test Generator")
    parser.add_argument("--url", default="http://localhost:8000/api/tasks", help="Endpoint to test")
    parser.add_argument("--concurrency", type=int, default=10, help="Number of concurrent workers")
    parser.add_argument("--requests", type=int, default=200, help="Total number of requests")
    args = parser.parse_args()

    print(f"🚀 Starting load test on {args.url}")
    print(f"   Concurrency: {args.concurrency} | Total requests: {args.requests}\n")

    start_time = time.perf_counter()
    statuses = {}
    durations = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = [executor.submit(make_request, args.url) for _ in range(args.requests)]
        for f in concurrent.futures.as_completed(futures):
            status, duration = f.result()
            statuses[status] = statuses.get(status, 0) + 1
            durations.append(duration)

    total_time = time.perf_counter() - start_time
    avg_latency = (sum(durations) / len(durations)) * 1000 if durations else 0
    rps = args.requests / total_time if total_time > 0 else 0

    print("📊 Load Test Results:")
    print(f"   Total Time:        {total_time:.2f} seconds")
    print(f"   Requests/sec:      {rps:.2f} req/s")
    print(f"   Average Latency:   {avg_latency:.2f} ms")
    print(f"   Status Breakdown:  {statuses}")

if __name__ == "__main__":
    main()
