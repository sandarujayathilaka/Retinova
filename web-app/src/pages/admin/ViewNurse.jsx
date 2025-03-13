import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetNurseById } from "@/services/nurse.service";
import { PushSpinner } from "react-spinners-kit";
import { Calendar, Clock, MapPin, Phone, Mail, Tag, Award } from "lucide-react";
import { format, parseISO } from "date-fns";

function ViewNurse({ nurseId = null, trigger, open, onOpenChange }) {
  // Fetch nurse data if in edit mode
  const { data: nurse, isLoading } = useGetNurseById(nurseId, {
    enabled: Boolean(nurseId),
  });

  // Format date function using date-fns
  const formatDate = dateString => {
    try {
      return format(parseISO(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || "View"}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-screen">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nurse Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <PushSpinner size={30} color="#3B82F6" />
          </div>
        ) : nurse ? (
          <div className="flex flex-col">
            {/* Fixed Header with image and basic info */}
            <div className="flex items-center gap-4 mb-4">
              {nurse.image && (
                <div className="relative w-24 h-24 overflow-hidden rounded-full">
                  <img
                    src={nurse.image.Location}
                    alt={nurse.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{nurse.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-blue-600">
                  <Award size={16} />
                  <span>{nurse.specialty}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <Tag size={16} />
                  <span>{nurse.type}</span>
                </div>
                <div className="mt-1 text-sm px-2 py-0.5 bg-gray-100 rounded-full inline-block">
                  Status: {nurse.status ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Scrollable content area for everything below the header */}
            <div className="space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-240px)] pr-2">
              {/* Contact Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-3 text-lg font-semibold">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span>{nurse.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span>{nurse.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{nurse.address}</span>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-3 text-lg font-semibold">Working Hours</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {nurse.workingHours &&
                    Object.entries(nurse.workingHours).map(([day, hours]) => (
                      <div
                        key={day}
                        className={`p-2 rounded ${
                          hours.enabled
                            ? "border-l-4 border-blue-500"
                            : "border-l-4 border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{day}</span>
                          {hours.enabled ? (
                            <span className="text-sm text-blue-600">
                              {hours.startTime} - {hours.endTime}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Off</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Days Off */}
              {nurse.daysOff && nurse.daysOff.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="mb-3 text-lg font-semibold">Scheduled Time Off</h3>
                  <div className="space-y-2">
                    {nurse.daysOff.map((dayOff, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="font-medium">{dayOff.dayOffName}</div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>
                            {formatDate(dayOff.startDate)} - {formatDate(dayOff.endDate)}
                          </span>
                        </div>
                        {dayOff.repeatYearly && (
                          <div className="mt-1 text-xs text-blue-600">Repeats yearly</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer with timestamps */}
              <div className="pt-2 mt-4 text-xs text-gray-500 border-t">
                <div>Created: {formatDate(nurse.createdAt)}</div>
                <div>Last Updated: {formatDate(nurse.updatedAt)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No nurse data found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ViewNurse;
