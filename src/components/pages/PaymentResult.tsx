import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const status = params.get("status");
  const amount = params.get("amount");
  const transactionId = params.get("transaction_id");

  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (status === "Completed") {
      let timer: number;
      let redirect: number;
      timer = setInterval(() => {
        setSeconds((s: number) => {
          if (s <= 1) {
            clearInterval(timer);
          }
          return s - 1;
        });
      }, 1000);
      redirect = setTimeout(() => {
        navigate("/user-dashboard");
      }, 5000);
      return () => {
        clearInterval(timer);
        clearTimeout(redirect);
      };
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-primary-200 flex flex-col items-center max-w-md w-full animate-fadeIn">
        {status === "Completed" ? (
          <>
            <div className="mb-6">
              <svg
                className="mx-auto"
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="36" cy="36" r="36" fill="#34D399" />
                <path
                  d="M22 37L32 47L50 29"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-primary-700 mb-2 text-center">
              Payment Successful!
            </h2>
            <p className="text-lg text-gray-700 mb-4 text-center">
              Thank you for your payment. Your booking will be processed
              shortly.
            </p>
            <div className="mb-4 text-center">
              {amount && (
                <div className="font-semibold text-primary-600">
                  Amount Paid: Rs {amount}
                </div>
              )}
              {transactionId && (
                <div className="text-gray-500 text-sm">
                  Transaction ID: {transactionId}
                </div>
              )}
            </div>
            <div className="mb-2 text-center text-gray-500">
              Redirecting to your dashboard in{" "}
              <span className="font-bold text-primary-700">{seconds}</span>{" "}
              seconds...
            </div>
            <button
              className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              onClick={() => navigate("/user-dashboard")}
            >
              Go to Dashboard Now
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <svg
                className="mx-auto"
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="36" cy="36" r="36" fill="#F87171" />
                <path
                  d="M24 24L48 48M48 24L24 48"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-red-600 mb-2 text-center">
              Payment Failed
            </h2>
            <p className="text-lg text-gray-700 mb-4 text-center">
              Your payment was not completed or was canceled. Please try again.
            </p>
            <button
              className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              onClick={() => navigate("/venues")}
            >
              Back to Venues
            </button>
          </>
        )}
      </div>
    </div>
  );
}
