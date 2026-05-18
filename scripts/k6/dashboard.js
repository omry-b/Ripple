import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
};

const base = __ENV.BASE_URL || "http://127.0.0.1:3000";

export default function () {
  const res = http.get(`${base}/api/dashboard`);
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}
