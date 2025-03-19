import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetNurseById } from "@/services/nurse.service";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Tag,
  Award,
  UserRound,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

function ViewNurse({ nurseId = null, trigger, open, onOpenChange }) {
  // Fetch nurse data
  const { data: nurse, isLoading } = useGetNurseById(nurseId, {
    enabled: Boolean(nurseId),
  });

  // Format date function using date-fns
  const formatDate = dateString => {
    try {
      return format(parseISO(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[100vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold text-violet-700">Nurse Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
            <p className="text-slate-600">Loading nurse information...</p>
          </div>
        ) : nurse ? (
          <div className="flex flex-col overflow-hidden">
            {/* Nurse Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20 border-2 border-slate-200">
                <AvatarImage
                  src={nurse.image?.Location}
                  alt={nurse.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-violet-100 text-violet-800 text-xl font-semibold">
                  {nurse.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-xl font-bold text-slate-800">{nurse.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-violet-600">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">{nurse.specialty}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="bg-slate-50">
                    <Tag className="h-3 w-3 mr-1" />
                    {nurse.type}
                  </Badge>
                  {/* <Badge
                    className={
                      nurse.status
                        ? "bg-violet-100 text-violet-800 hover:bg-violet-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                  >
                    {nurse.status ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                      </>
                    )}
                  </Badge> */}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-6 overflow-y-auto pr-2 pb-4 max-h-[calc(90vh-200px)]">
              {/* Contact Information */}
              <Card className="border-slate-200">
                <CardContent className="pt-5">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                    <UserRound className="h-4 w-4 mr-2 text-violet-600" />
                    Contact Information
                  </h3>
                  <div className="grid gap-3 pl-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{nurse.phone || "No phone number provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-blue-600">{nurse.email}</span>
                    </div>
                    {nurse.address && (
                      <div className="flex items-start gap-2 text-sm text-slate-700">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <span className="break-words">{nurse.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              <Card className="border-slate-200">
                <CardContent className="pt-5">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-violet-600" />
                    Working Hours
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {nurse.workingHours &&
                      Object.entries(nurse.workingHours).map(([day, hours]) => (
                        <div
                          key={day}
                          className={`flex justify-between items-center p-2.5 rounded-md ${
                            hours.enabled
                              ? "bg-violet-50 border-l-4 border-violet-500"
                              : "bg-slate-50 border-l-4 border-slate-300"
                          }`}
                        >
                          <span className="font-medium text-sm">{day}</span>
                          {hours.enabled ? (
                            <span className="text-xs font-medium text-violet-700 bg-white px-2 py-0.5 rounded-full">
                              {hours.startTime} - {hours.endTime}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full">
                              Off Day
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Days Off */}
              {nurse.daysOff && nurse.daysOff.length > 0 && (
                <Card className="border-slate-200">
                  <CardContent className="pt-5">
                    <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-violet-600" />
                      Scheduled Time Off
                    </h3>
                    <div className="space-y-3">
                      {nurse.daysOff.map((dayOff, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-md border border-slate-200 bg-slate-50"
                        >
                          <div className="font-medium text-sm text-slate-800">
                            {dayOff.dayOffName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(dayOff.startDate)} - {formatDate(dayOff.endDate)}
                            </span>
                          </div>
                          {dayOff.repeatYearly && (
                            <div className="mt-1.5 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full w-fit">
                              Repeats yearly
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Footer with timestamps */}
              <div className="pt-2 text-xs text-slate-500">
                <Separator className="mb-2" />
                <div className="flex justify-between">
                  <div>Created: {formatDate(nurse.createdAt)}</div>
                  <div>Last Updated: {formatDate(nurse.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-md">
            <UserRound className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>No nurse information found</p>
            <p className="text-xs mt-1">The requested nurse data could not be retrieved</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ViewNurse;
