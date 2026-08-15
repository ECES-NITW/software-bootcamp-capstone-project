import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const openRazorpay = (options) =>
    new Promise((resolve, reject) => {
        if (!window.Razorpay) {
            reject(new Error("Razorpay SDK is not loaded"));
            return;
        }
        const razorpay = new window.Razorpay({
            ...options,
            handler: resolve,
            modal: {
                ondismiss: () => reject(new Error("Payment was cancelled")),
            },
        });
        razorpay.on("payment.failed", (response) =>
            reject(new Error(response.error?.description || "Payment failed")),
        );
        razorpay.open();
    });

export const usePayOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId) => {
            const createRes = await api.post(`/payments/create/${orderId}`);
            const { razorpayOrderId, amount, currency, key } = createRes.data;

            const payment = await openRazorpay({
                key,
                amount,
                currency,
                name: "Campus Marketplace",
                description: "Secure Purchase Payment",
                order_id: razorpayOrderId,
                theme: { color: "#415a42" },
            });

            const verifyRes = await api.post("/payments/verify", {
                orderId,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_signature: payment.razorpay_signature,
            });
            return verifyRes.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_orders"] });
            queryClient.invalidateQueries({ queryKey: ["received_orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
