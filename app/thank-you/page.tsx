"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CheckCircle, Home, Package } from "lucide-react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl mb-4 text-[#222222]">
          Thank You for Your Order!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          We've received your details and our team will contact you soon.
        </p>

        {orderId && (
          <div className="bg-[#F4E9D8] p-4 rounded-lg mb-8 inline-block">
            <p className="text-sm text-gray-600 mb-1">Your Order ID</p>
            <p className="text-lg text-[#3C6E47]">{orderId}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#3C6E47]" />
            What happens next?
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#3C6E47] text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              <span>Our team will review your order and contact you within 24 hours</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#3C6E47] text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              <span>We'll confirm your order details and arrange payment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#3C6E47] text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              <span>Your order will be carefully packaged and dispatched</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#3C6E47] text-white rounded-full flex items-center justify-center text-sm">
                4
              </span>
              <span>We'll send you tracking details for delivery</span>
            </li>
          </ul>
        </div>

        {/* <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-8">
          <p className="text-green-800 text-sm">
            📧 A confirmation email has been sent to your registered email address
          </p>
        </div> */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-[#3C6E47] hover:bg-[#2d5336] gap-2"
          >
            <Package className="w-4 h-4" />
            Continue Shopping
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{" "}
            <a href="mailto:support@kavisnaturals.com" className="text-[#3C6E47] hover:underline">
              support@kavisnaturals.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
