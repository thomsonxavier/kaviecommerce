'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submission:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#222222] mb-4">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Visit Our Store Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-[#222222] mb-8">Visit Our Store</h2>
            
            <div className="space-y-6">
              {/* Address */}
              <div>
                <h3 className="font-semibold text-[#222222] mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3C6E47]" />
                  Address
                </h3>
                <div className="text-gray-600 leading-relaxed">
                  <p className="font-medium">Vector Agro Foods</p>
                  <p>544/1, Therku Thottam,</p>
                  <p>Bodithimmanampalayam,</p>
                  <p>Kuppepalayam Post,</p>
                  <p>SS Kulam Via,</p>
                  <p>Coimbatore – 641107</p>
                </div>
              </div>

              {/* Phone */}
              <div>
                <h3 className="font-semibold text-[#222222] mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#3C6E47]" />
                  Phone
                </h3>
                <p className="text-gray-600">+91 75502 56569</p>
              </div>

              {/* Email */}
              <div>
                <h3 className="font-semibold text-[#222222] mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#3C6E47]" />
                  Email
                </h3>
                <p className="text-gray-600">vectoragrofoods@gmail.com</p>
              </div>

              {/* Open Time */}
              <div>
                <h3 className="font-semibold text-[#222222] mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#3C6E47]" />
                  Open Time
                </h3>
                <p className="text-gray-600">Opened anytime for you !!</p>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <div className="flex gap-4">
                  <button className="w-10 h-10 bg-[#3C6E47] hover:bg-[#2d5235] rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="w-5 h-5 text-white" />
                  </button>
                  <button className="w-10 h-10 bg-[#3C6E47] hover:bg-[#2d5235] rounded-full flex items-center justify-center transition-colors">
                    <Instagram className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Get in Touch Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-[#222222] mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              If you&apos;ve got great products your making or looking to work with us then drop us a line.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="min-h-[120px] rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#3C6E47] hover:bg-[#2d5235] text-white rounded-xl font-medium"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
