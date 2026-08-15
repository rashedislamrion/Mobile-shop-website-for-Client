"use client";

import { useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TABS = ["Running", "Completed", "Cancel"];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("Running");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Support ticket created successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Ticket</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Order Number (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ord-001">#ORD-001</SelectItem>
                    <SelectItem value="ord-002">#ORD-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery Issue</SelectItem>
                    <SelectItem value="product">Product Defect</SelectItem>
                    <SelectItem value="refund">Refund/Return</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input required placeholder="Brief summary of the issue" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required placeholder="Please provide details about your issue..." className="resize-none min-h-[100px]" />
              </div>
              <Button type="submit" className="w-full">Submit Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <TabsList className="bg-transparent p-0 h-auto gap-2">
            {TABS.map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="rounded-full border border-slate-200 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
              >
                {tab} (0)
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0 outline-none">
              <EmptyState 
                icon={LifeBuoy} 
                title="No Ticket Found" 
                subtitle={`You have no ${tab.toLowerCase()} support tickets.`}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
