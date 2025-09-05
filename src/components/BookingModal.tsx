import React, { useRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useAuth } from "../context/AuthContext";
import { getReservationList } from "./Api/getapi";

declare global {
  interface Window {
    KhaltiCheckout?: any;
  }
}

interface BookingModalProps {
  open: boolean;
  venue: any;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  bookedDates: Date[];
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  venue,
  selectedDate,
  setSelectedDate,
  bookedDates,
  onClose,
  onConfirm,
  loading,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [showKhalti, setShowKhalti] = React.useState(false);
  const [userPendingDates, setUserPendingDates] = useState<Date[]>([]);
  const khaltiBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchUserPendingDates() {
      if (!user || !venue) return;
      try {
        const res = await getReservationList();
        const reservations = res.data;
        const pendingDates = reservations
          .filter(
            (r: any) =>
              r.user === user.id &&
              r.status === "pending" &&
              r.event.venue === venue.id
          )
          .map((r: any) => new Date(r.event.date));
        setUserPendingDates(pendingDates);
      } catch (err) {
        setUserPendingDates([]);
      }
    }
    fetchUserPendingDates();
  }, [user, venue]);

  useEffect(() => {
    async function initiateKhaltiPayment() {
      if (showKhalti && venue && user) {
        const paymentData = {
          return_url: window.location.origin + "/payment/", // Change to your actual return URL
          website_url: window.location.origin + "/", // Your website URL
          amount: venue.price ? venue.price * 100 : 1000, // Amount in paisa
          purchase_order_id: `venue_${venue.id}_${Date.now()}`,
          purchase_order_name: venue.name || "Venue Booking",
          customer_info: {
            name: user.name || "User",
            email: user.email || "",
          },
          amount_breakdown: [
            {
              label: "Base Price",
              amount: venue.price ? venue.price * 100 : 1000,
            },
          ],
          product_details: [
            {
              identity: venue.id?.toString() || "1234567890",
              name: venue.name || "Venue",
              total_price: venue.price ? venue.price * 100 : 1000,
              quantity: 1,
              unit_price: venue.price ? venue.price * 100 : 1000,
            },
          ],
          merchant_username: "merchant_name", // Replace with your merchant username
          merchant_extra: "venue_booking",
        };
        try {
          const res = await fetch("/api/khalti/initiate/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
          });
          const result = await res.json();
          if (result.payment_url) {
            window.location.href = result.payment_url;
          } else {
            alert("Payment initiation failed!");
          }
        } catch (err) {
          alert("Payment initiation error!");
        }
        setShowKhalti(false);
      }
    }
    initiateKhaltiPayment();
  }, [showKhalti, venue, user]);

  if (!open || !venue) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative overflow-auto"
        style={{ maxHeight: "90vh" }}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Book {venue.name}</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            excludeDates={[...bookedDates, ...userPendingDates]}
            inline
            calendarClassName="!border !rounded-xl !shadow-lg !bg-white !p-4"
            dayClassName={(date) =>
              `!rounded-full transition-all duration-150
              ${
                selectedDate &&
                date.toDateString() === selectedDate.toDateString()
                  ? "bg-primary-600 text-white !font-bold"
                  : "hover:bg-primary-100 hover:text-primary-700"
              }
              ${
                date.toDateString() === new Date().toDateString()
                  ? "ring-2 ring-primary-400"
                  : ""
              }`
            }
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex items-center justify-between mb-4 px-2">
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
                  type="button"
                >
                  <span className="text-lg">&#8592;</span>
                </button>
                <span className="font-semibold text-lg text-primary-700">
                  {date.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
                  type="button"
                >
                  <span className="text-lg">&#8594;</span>
                </button>
              </div>
            )}
          />
          <div className="text-xs text-gray-500 mt-2">
            Unavailable dates are disabled.
          </div>
        </div>
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded overflow-auto">
          <strong>Note:</strong> To get your booking approved, you must pay the
          base price shown for this venue.
          <br />
          <span className="font-semibold">Base Price:</span>{" "}
          <span className="text-primary-700">
            {venue?.price ? `Rs. ${venue.price}` : "N/A"}
          </span>
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 mb-2"
          disabled={loading}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
        {/* Khalti Payment Button */}
        {isAuthenticated && (
          <button
            ref={khaltiBtnRef}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
            style={{ marginTop: 8 }}
            onClick={() => setShowKhalti(true)}
            disabled={loading}
          >
            Pay with Khalti (Checkout)
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
