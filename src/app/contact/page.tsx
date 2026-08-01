import InquiryForm from "./InquiryForm";
import { MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

// Update these with your real business details before launch
const WHATSAPP_NUMBER = "+94764454814"; // no + or spaces, country code first
const BUSINESS_ADDRESS = "Kurunegala, madige midiyala , bandara koswatta";
const MAP_QUERY = encodeURIComponent(BUSINESS_ADDRESS);

const whatsappQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
  `https://wa.me/${WHATSAPP_NUMBER}`
)}`;

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function ContactPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Contact Us</h1>
        <p className="text-gray-500 mt-1">
          Questions about an order, a product, or anything else? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Inquiry form */}
        <InquiryForm />

        {/* Address, map, WhatsApp, social */}
        <div className="space-y-6">
          <div className="border rounded-xl bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-brand-600" />
              <h2 className="font-semibold">Our Location</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">{BUSINESS_ADDRESS}</p>
            <div className="rounded-lg overflow-hidden border">
              <iframe
                title="Store location"
                width="100%"
                height="180"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=15&output=embed`}
              />
            </div>
          </div>

          <div className="border rounded-xl bg-white p-5 text-center">
            <h2 className="font-semibold mb-3">Chat on WhatsApp</h2>
            <img
              src={whatsappQrUrl}
              alt="WhatsApp QR code"
              className="mx-auto rounded-lg border"
              width={140}
              height={140}
            />
            <p className="text-xs text-gray-400 mt-3">
              Scan to message us directly on WhatsApp
            </p>
          </div>

          <div className="border rounded-xl bg-white p-5">
            <h2 className="font-semibold mb-4 text-center">Follow Us</h2>
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
