"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMedicalProfile,
  useUpdateMedicalProfile,
} from "@/lib/hooks/entities/useEmergency";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function MedicalProfileForm() {
  const router = useRouter();
  const { data: profile, isLoading } = useMedicalProfile();
  const updateProfile = useUpdateMedicalProfile();

  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [conditions, setConditions] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setBloodGroup((profile.bloodGroup as string) || "");
      setAllergies(
        Array.isArray(profile.allergies)
          ? profile.allergies.join(", ")
          : (profile.allergies as string) || ""
      );
      setMedications(
        Array.isArray(profile.medications)
          ? profile.medications.join(", ")
          : (profile.medications as string) || ""
      );
      setConditions(
        Array.isArray(profile.conditions)
          ? profile.conditions.join(", ")
          : (profile.conditions as string) || ""
      );
      const ec = profile.emergencyContact as Record<string, string> | undefined;
      if (ec) {
        setEmergencyContactName(ec.name || "");
        setEmergencyContactPhone(ec.phone || "");
        setEmergencyContactRelationship(ec.relationship || "");
      }
      const doc = profile.doctor as Record<string, string> | undefined;
      if (doc) {
        setDoctorName(doc.name || "");
        setDoctorPhone(doc.phone || "");
      }
    }
  }, [profile]);

  const parseCommaSeparated = (value: string): string[] => {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      bloodGroup,
      allergies: parseCommaSeparated(allergies),
      medications: parseCommaSeparated(medications),
      conditions: parseCommaSeparated(conditions),
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relationship: emergencyContactRelationship,
      },
      doctor: {
        name: doctorName,
        phone: doctorPhone,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/emergency")}
      >
        <ArrowLeft className="size-4" />
        Back to Emergency
      </Button>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger id="bloodGroup" className="h-11">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Dust (comma-separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Input
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Aspirin, Metformin (comma-separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Input
                id="conditions"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. Diabetes, Hypertension (comma-separated)"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ecName">Name</Label>
                  <Input
                    id="ecName"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecPhone">Phone</Label>
                  <Input
                    id="ecPhone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecRelationship">Relationship</Label>
                  <Input
                    id="ecRelationship"
                    value={emergencyContactRelationship}
                    onChange={(e) =>
                      setEmergencyContactRelationship(e.target.value)
                    }
                    placeholder="e.g. Spouse, Parent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Doctor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docName">Doctor Name</Label>
                  <Input
                    id="docName"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Doctor's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docPhone">Doctor Phone</Label>
                  <Input
                    id="docPhone"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="Doctor's phone"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/emergency")}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
