"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Generate arrays for dropdowns
const years = Array.from({ length: 10 }, (_, i) => 2020 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

interface CreateEntryDialogProps {
  onCreateEntry: (entry: {
    timestamp: string;
    consumption: number;
    peak: boolean;
    reason: string;
    encrypted: boolean;
  }) => void;
  isCreating?: boolean;
}

const CreateEntryDialog = ({
  onCreateEntry,
  isCreating,
}: CreateEntryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    year: "2025",
    month: "11",
    day: "9",
    hour: "12",
    minute: "00",
    consumption: "",
    peak: false,
    reason: "",
    encrypted: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consumption || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time into timestamp
    const pad = (n: string | number) => String(n).padStart(2, "0");
    const timestamp = `${formData.year}-${pad(formData.month)}-${pad(formData.day)}T${pad(formData.hour)}:${pad(formData.minute)}`;

    onCreateEntry({
      timestamp,
      consumption: Number(formData.consumption),
      peak: formData.peak,
      reason: formData.reason,
      encrypted: formData.encrypted,
    });

    setFormData({
      year: "2025",
      month: "11",
      day: "9",
      hour: "12",
      minute: "00",
      consumption: "",
      peak: false,
      reason: "",
      encrypted: true,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Consumption Entry</DialogTitle>
          <DialogDescription>
            Add a new encrypted energy consumption record to the blockchain
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={formData.year}
                  onValueChange={(value) =>
                    setFormData({ ...formData, year: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.month}
                  onValueChange={(value) =>
                    setFormData({ ...formData, month: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {String(m).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.day}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {String(d).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Time *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={formData.hour}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hour: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.minute}
                  onValueChange={(value) =>
                    setFormData({ ...formData, minute: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {String(m).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumption">Consumption (kWh) *</Label>
              <Input
                id="consumption"
                type="number"
                placeholder="Enter consumption in kWh"
                value={formData.consumption}
                onChange={(e) =>
                  setFormData({ ...formData, consumption: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="peak" className="flex-1">
                Peak Period
              </Label>
              <Switch
                id="peak"
                checked={formData.peak}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, peak: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Notes *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for consumption level or outage details"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="encrypted" className="flex-1">
                Encrypt Data (FHE)
              </Label>
              <Switch
                id="encrypted"
                checked={formData.encrypted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, encrypted: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEntryDialog;
