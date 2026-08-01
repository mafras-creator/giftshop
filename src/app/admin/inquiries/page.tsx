import { prisma } from "@/lib/prisma";
import InquiryRow from "./InquiryRow";
import { MessageSquare } from "lucide-react";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Messages submitted through the Contact Us page.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="border rounded-xl bg-white text-center py-16">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              id={inquiry.id}
              queryType={inquiry.queryType}
              fullName={inquiry.fullName}
              email={inquiry.email}
              mobile={inquiry.mobile}
              message={inquiry.message}
              isRead={inquiry.isRead}
              createdAt={inquiry.createdAt.toLocaleString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
