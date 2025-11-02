'use client';

import { CheckCircle, Clock, AlertCircle, XCircle, Phone } from 'lucide-react';
import { Header } from '../../components/Header';

export default function Returns() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#222222] mb-4">
            📋 Refund and Returns Policy
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            💰 We issue refunds only for eligible returns or cancellations as per the policy above
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Section 1: Refund Eligibility */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#222222] mb-2">
                  ✅ 1. Refund Eligibility
                </h2>
                <p className="text-gray-600 mb-4">💳 Refunds will be processed if:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">⏰</span>
                    <span>Cancellation is made in time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">✔️</span>
                    <span>Return is verified by our team and approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">📦</span>
                    <span>Item is returned unused and in original condition</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Refund Mode */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#222222] mb-2">
                  💳 2. Refund Mode
                </h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">💳</span>
                    <span>Prepaid orders: Refunded to the original payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">🏦</span>
                    <span>COD orders: Refunded via UPI or bank transfer (requires bank details)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#222222] mb-2">
                  ⏰ 3. Timeline
                </h2>
                <p className="text-gray-600">
                  📅 Refunds are processed within 5-7 working days after we receive and inspect the returned item.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: No Refund If */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#222222] mb-2">
                  ❌ No Refund If:
                </h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">⏱️</span>
                    <span>Return request exceeds 2-day window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">📦</span>
                    <span>Package shows signs of use or tampering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">❌</span>
                    <span>Delivery was unsuccessful due to customer error</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-6">
            <Phone className="w-6 h-6 text-[#3C6E47] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-[#222222] mb-2">📞 Customer Support</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">📍</span>
                  <div>
                    <p className="font-medium">Address:</p>
                    <p>Vector Agro Foods, 544/1, Therku Thottam,</p>
                    <p>Bodithimmanampalayam, Kuppepalayam Post,</p>
                    <p>SS Kulam Via, Coimbatore – 641107</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">✉️</span>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-1">vectoragrofoods@gmail.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">📱</span>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <span className="ml-1">+91 75502 56569</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
