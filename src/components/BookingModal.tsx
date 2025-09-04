import React, { useRef } from "react";

declare global {
  interface Window {
    KhaltiCheckout?: any;
  }
}
import DatePicker from "react-datepicker";

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
  const [showKhalti, setShowKhalti] = React.useState(false);
  const khaltiBtnRef = useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (showKhalti && window.KhaltiCheckout) {
      const config = {
        publicKey: "test_public_key_ab4ce8ec82bf4663a471363d88b43d82",
        productIdentity: venue?.id?.toString() || "1234567890",
        productName: venue?.name || "Test Product",
        productUrl: window.location.href,
        paymentPreference: ["KHALTI"],
        eventHandler: {
          onSuccess(payload: any) {
            alert("Payment successful! Check console for payload.");
            console.log("Success Payload:", payload);
            setShowKhalti(false);
          },
          onError(error: any) {
            alert("Payment error!");
            console.log("Error:", error);
          },
          onClose() {
            console.log("Khalti widget closed");
            setShowKhalti(false);
          },
        },
      };
      // @ts-ignore
      const checkout = new window.KhaltiCheckout(config);
      // Show Khalti widget
      checkout.show({ amount: 1000 }); // Amount in paisa
    }
  }, [showKhalti, venue]);

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
            excludeDates={bookedDates}
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
        <button
          ref={khaltiBtnRef}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
          style={{ marginTop: 8 }}
          onClick={() => setShowKhalti(true)}
          disabled={loading}
        >
          Pay with Khalti
        </button>
      </div>
    </div>
  );
};

export default BookingModal;
